package com.example.extraction

import android.util.Log
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONArray
import org.json.JSONObject
import java.util.concurrent.TimeUnit

data class ExtractedStream(
    val url: String,
    val quality: String,
    val mimeType: String,
    val isVideoOnly: Boolean
)

data class ExtractionResult(
    val title: String,
    val durationSeconds: Long,
    val streams: List<ExtractedStream>
)

class YoutubeExtractor {
    private val client = OkHttpClient.Builder()
        .connectTimeout(10, TimeUnit.SECONDS)
        .readTimeout(10, TimeUnit.SECONDS)
        .build()

    interface Logger {
        fun log(message: String)
    }

    /**
     * Attempts direct client-side manual extraction using InnerTube API or watch page scraping.
     */
    @Throws(Exception::class)
    fun extractVideo(videoId: String, logger: Logger? = null): ExtractionResult {
        logger?.log("🛠️ [Manual Extractor] Initiating manual extraction for Video ID: $videoId")
        
        // Method A: YouTube InnerTube Android API
        try {
            logger?.log("🛠️ [Manual Extractor] Attempting InnerTube player API request...")
            val result = extractViaInnerTube(videoId, logger)
            if (result != null && result.streams.isNotEmpty()) {
                logger?.log("✅ [Manual Extractor] InnerTube extraction succeeded! Extracted ${result.streams.size} streams.")
                return result
            }
        } catch (e: Exception) {
            logger?.log("⚠️ [Manual Extractor] InnerTube API failed: ${e.localizedMessage}")
        }

        // Method B: YouTube Web Watch Page Scraping
        try {
            logger?.log("🛠️ [Manual Extractor] InnerTube failed. Attempting Web Watch Page extraction...")
            val result = extractViaWatchPage(videoId, logger)
            if (result != null && result.streams.isNotEmpty()) {
                logger?.log("✅ [Manual Extractor] Web watch page extraction succeeded! Extracted ${result.streams.size} streams.")
                return result
            }
        } catch (e: Exception) {
            logger?.log("⚠️ [Manual Extractor] Web watch page failed: ${e.localizedMessage}")
        }

        throw Exception("Both manual extraction methods failed! Stream is likely throttled, cipher-encrypted, or geo-blocked by YouTube.")
    }

    /**
     * Client-side Web Scraping Search (NewPipe-like parser extracting ytInitialData)
     */
    fun searchVideosDirect(query: String, logger: Logger? = null): List<com.example.api.PipedSearchResult> {
        return searchVideosDirectWithContinuation(query, null, logger).first
    }

    /**
     * Client-side Web Scraping Search with Continuation/Pagination support
     */
    fun searchVideosDirectWithContinuation(
        query: String,
        continuationToken: String? = null,
        logger: Logger? = null
    ): Pair<List<com.example.api.PipedSearchResult>, String?> {
        val list = mutableListOf<com.example.api.PipedSearchResult>()
        var nextContinuationToken: String? = null
        
        // Strategy A: YouTube InnerTube Search API (No key, clean JSON API, extremely fast and resilient)
        try {
            if (continuationToken != null) {
                logger?.log("🛠️ [Manual Search] Loading next page of results with continuation token...")
            } else {
                logger?.log("🛠️ [Manual Search] Querying YouTube InnerTube Search API for: \"$query\"")
            }
            val url = "https://www.youtube.com/youtubei/v1/search"
            val jsonPayload = JSONObject().apply {
                val context = JSONObject().apply {
                    val clientObj = JSONObject().apply {
                        put("clientName", "WEB")
                        put("clientVersion", "2.20210621.02.00")
                        put("hl", "en")
                        put("gl", "US")
                    }
                    put("client", clientObj)
                }
                put("context", context)
                if (continuationToken != null) {
                    put("continuation", continuationToken)
                } else {
                    put("query", query)
                }
            }

            val mediaType = "application/json; charset=utf-8".toMediaType()
            val body = jsonPayload.toString().toRequestBody(mediaType)
            val request = Request.Builder()
                .url(url)
                .post(body)
                .header("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36")
                .header("Content-Type", "application/json")
                .build()

            client.newCall(request).execute().use { response ->
                if (response.isSuccessful) {
                    val responseString = response.body?.string() ?: ""
                    val json = JSONObject(responseString)
                    
                    val renderers = mutableListOf<JSONObject>()
                    fun findVideoRenderers(value: Any) {
                        if (value is JSONObject) {
                            if (value.has("videoRenderer")) {
                                value.optJSONObject("videoRenderer")?.let { renderers.add(it) }
                            }
                            val keys = value.keys()
                            while (keys.hasNext()) {
                                findVideoRenderers(value.get(keys.next()))
                            }
                        } else if (value is JSONArray) {
                            for (i in 0 until value.length()) {
                                findVideoRenderers(value.get(i))
                            }
                        }
                    }

                    findVideoRenderers(json)
                    
                    // Recursive function to find continuation token in response
                    fun findContinuation(value: Any) {
                        if (value is JSONObject) {
                            if (value.has("continuationCommand")) {
                                val cmd = value.optJSONObject("continuationCommand")
                                val token = cmd?.optString("token")
                                if (!token.isNullOrEmpty()) {
                                    nextContinuationToken = token
                                }
                            }
                            val keys = value.keys()
                            while (keys.hasNext()) {
                                findContinuation(value.get(keys.next()))
                            }
                        } else if (value is JSONArray) {
                            for (i in 0 until value.length()) {
                                findContinuation(value.get(i))
                            }
                        }
                    }
                    findContinuation(json)

                    for (videoObj in renderers) {
                        val videoId = videoObj.optString("videoId", "")
                        if (videoId.isEmpty()) continue

                        // Title
                        val titleObj = videoObj.optJSONObject("title")
                        val title = titleObj?.optJSONArray("runs")?.optJSONObject(0)?.optString("text")
                            ?: titleObj?.optString("simpleText", "Unknown")
                            ?: "Unknown"

                        // Thumbnail
                        val thObj = videoObj.optJSONObject("thumbnail")
                        val thumbnail = thObj?.optJSONArray("thumbnails")?.optJSONObject(0)?.optString("url") ?: ""

                        // Channel
                        val ownerObj = videoObj.optJSONObject("ownerText")
                        val uploader = ownerObj?.optJSONArray("runs")?.optJSONObject(0)?.optString("text")
                            ?: videoObj.optJSONObject("shortBylineText")?.optJSONArray("runs")?.optJSONObject(0)?.optString("text")
                            ?: "Unknown Channel"

                        // Duration
                        val lenObj = videoObj.optJSONObject("lengthText")
                        val lenStr = lenObj?.optString("simpleText", "") ?: ""
                        val durationSeconds = parseDurationStringToSeconds(lenStr)

                        // Views
                        val viewCountObj = videoObj.optJSONObject("viewCountText")
                        val viewStr = viewCountObj?.optString("simpleText", "") ?: ""
                        val views = parseViewsString(viewStr)

                        // Uploaded string
                        val publishedObj = videoObj.optJSONObject("publishedTimeText")
                        val uploadedString = publishedObj?.optString("simpleText", "") ?: ""

                        list.add(
                            com.example.api.PipedSearchResult(
                                id = videoId,
                                title = title,
                                thumbnail = thumbnail,
                                uploader = uploader,
                                duration = durationSeconds,
                                views = views,
                                uploadedString = uploadedString
                            )
                        )
                    }

                    if (list.isNotEmpty()) {
                        logger?.log("✅ [Manual Search] InnerTube Search succeeded! Loaded ${list.size} videos.")
                        if (!nextContinuationToken.isNullOrEmpty()) {
                            logger?.log("🔗 [Manual Search] Found continuation token for next page.")
                        }
                        return Pair(list, nextContinuationToken)
                    }
                } else {
                    logger?.log("⚠️ [Manual Search] InnerTube Search API returned HTTP code: ${response.code}")
                }
            }
        } catch (e: Exception) {
            logger?.log("⚠️ [Manual Search] InnerTube Search failed: ${e.localizedMessage}")
        }

        // Strategy B: YouTube HTML Watch Page Scraping (Legacy Fallback)
        logger?.log("🔄 [Manual Search] InnerTube Search yielded no results. Trying watch page scraping fallback...")
        val url = "https://www.youtube.com/results?search_query=${java.net.URLEncoder.encode(query, "UTF-8")}&sp=EgIQAQ==" // filter to videos only
        try {
            val request = Request.Builder()
                .url(url)
                .header("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36")
                .header("Accept-Language", "en-US,en;q=0.9")
                .header("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8")
                .header("Cookie", "CONSENT=YES+cb.20210328-17-p0.en+FX+917; SOCS=CAESEwgDEgk0ODE3Nzk3MjQaAmVuIAEaBgiA_eWfBg;")
                .build()

            client.newCall(request).execute().use { response ->
                if (!response.isSuccessful) {
                    logger?.log("❌ [Manual Search] Legacy scrape response failed: HTTP ${response.code}")
                    return Pair(emptyList(), null)
                }
                val html = response.body?.string() ?: ""
                val marker = "ytInitialData ="
                val index = html.indexOf(marker)
                if (index == -1) {
                    logger?.log("❌ [Manual Search] Legacy scrape: Could not find ytInitialData in HTML response.")
                    return Pair(emptyList(), null)
                }

                // Extract complete JSON by balancing brackets
                val jsonStart = html.indexOf("{", index)
                if (jsonStart != -1) {
                    var bracketCount = 0
                    var jsonEnd = -1
                    var inString = false
                    var escaped = false

                    for (i in jsonStart until html.length) {
                        val c = html[i]
                        if (escaped) {
                            escaped = false
                            continue
                        }
                        if (c == '\\') {
                            escaped = true
                            continue
                        }
                        if (c == '"') {
                            inString = !inString
                            continue
                        }
                        if (!inString) {
                            if (c == '{') {
                                bracketCount++
                            } else if (c == '}') {
                                bracketCount--
                                if (bracketCount == 0) {
                                    jsonEnd = i + 1
                                    break
                                }
                            }
                        }
                    }

                    if (jsonEnd != -1) {
                        val jsonStr = html.substring(jsonStart, jsonEnd)
                        val json = JSONObject(jsonStr)
                        
                        val renderers = mutableListOf<JSONObject>()
                        fun findVideoRenderers(value: Any) {
                            if (value is JSONObject) {
                                if (value.has("videoRenderer")) {
                                    value.optJSONObject("videoRenderer")?.let { renderers.add(it) }
                                }
                                val keys = value.keys()
                                while (keys.hasNext()) {
                                    findVideoRenderers(value.get(keys.next()))
                                }
                            } else if (value is JSONArray) {
                                for (i in 0 until value.length()) {
                                    findVideoRenderers(value.get(i))
                                }
                            }
                        }

                        findVideoRenderers(json)

                        for (videoObj in renderers) {
                            val videoId = videoObj.optString("videoId", "")
                            if (videoId.isEmpty()) continue

                            // Title
                            val titleObj = videoObj.optJSONObject("title")
                            val title = titleObj?.optJSONArray("runs")?.optJSONObject(0)?.optString("text")
                                ?: titleObj?.optString("simpleText", "Unknown")
                                ?: "Unknown"

                            // Thumbnail
                            val thObj = videoObj.optJSONObject("thumbnail")
                            val thumbnail = thObj?.optJSONArray("thumbnails")?.optJSONObject(0)?.optString("url") ?: ""

                            // Channel
                            val ownerObj = videoObj.optJSONObject("ownerText")
                            val uploader = ownerObj?.optJSONArray("runs")?.optJSONObject(0)?.optString("text")
                                ?: videoObj.optJSONObject("shortBylineText")?.optJSONArray("runs")?.optJSONObject(0)?.optString("text")
                                ?: "Unknown Channel"

                            // Duration
                            val lenObj = videoObj.optJSONObject("lengthText")
                            val lenStr = lenObj?.optString("simpleText", "") ?: ""
                            val durationSeconds = parseDurationStringToSeconds(lenStr)

                            // Views
                            val viewCountObj = videoObj.optJSONObject("viewCountText")
                            val viewStr = viewCountObj?.optString("simpleText", "") ?: ""
                            val views = parseViewsString(viewStr)

                            // Uploaded string
                            val publishedObj = videoObj.optJSONObject("publishedTimeText")
                            val uploadedString = publishedObj?.optString("simpleText", "") ?: ""

                            list.add(
                                com.example.api.PipedSearchResult(
                                    id = videoId,
                                    title = title,
                                    thumbnail = thumbnail,
                                    uploader = uploader,
                                    duration = durationSeconds,
                                    views = views,
                                    uploadedString = uploadedString
                                )
                            )
                        }
                        
                        if (list.isNotEmpty()) {
                            logger?.log("✅ [Manual Search] Legacy scrape succeeded! Loaded ${list.size} videos.")
                        }
                    }
                }
            }
        } catch (e: Exception) {
            logger?.log("❌ [Manual Search] Legacy scrape exception: ${e.localizedMessage}")
            Log.e("YoutubeExtractor", "Scraper search error", e)
        }

        return Pair(list, null)
    }

    /**
     * YouTube Data API v3 Search (using user's custom API key)
     */
    fun searchVideosWithKey(query: String, apiKey: String, logger: Logger? = null): List<com.example.api.PipedSearchResult> {
        val list = mutableListOf<com.example.api.PipedSearchResult>()
        val url = "https://www.googleapis.com/youtube/v3/search?part=snippet&q=${java.net.URLEncoder.encode(query, "UTF-8")}&type=video&maxResults=25&key=$apiKey"
        logger?.log("⚡ [Official API Search] Querying YouTube Data API v3...")

        try {
            val request = Request.Builder()
                .url(url)
                .build()

            client.newCall(request).execute().use { response ->
                if (!response.isSuccessful) {
                    val errMsg = response.body?.string() ?: ""
                    logger?.log("❌ [Official API Search] Failed: HTTP ${response.code} ($errMsg)")
                    return emptyList()
                }
                val bodyStr = response.body?.string() ?: ""
                val obj = JSONObject(bodyStr)
                val items = obj.optJSONArray("items")
                if (items != null) {
                    for (i in 0 until items.length()) {
                        val item = items.getJSONObject(i)
                        val idObj = item.optJSONObject("id")
                        val videoId = idObj?.optString("videoId", "") ?: ""
                        if (videoId.isEmpty()) continue

                        val snippet = item.optJSONObject("snippet") ?: continue
                        val title = snippet.optString("title", "No Title")
                        val uploader = snippet.optString("channelTitle", "Unknown Channel")
                        val thObj = snippet.optJSONObject("thumbnails")?.optJSONObject("medium")
                            ?: snippet.optJSONObject("thumbnails")?.optJSONObject("default")
                        val thumbnail = thObj?.optString("url", "") ?: ""
                        val publishedAt = snippet.optString("publishedAt", "")

                        list.add(
                            com.example.api.PipedSearchResult(
                                id = videoId,
                                title = title,
                                thumbnail = thumbnail,
                                uploader = uploader,
                                duration = 0, // YouTube search doesn't return duration directly (requires separate API call)
                                views = 0L,
                                uploadedString = publishedAt.substringBefore("T")
                            )
                        )
                    }
                }
                logger?.log("✅ [Official API Search] Successfully fetched ${list.size} results from official API!")
            }
        } catch (e: Exception) {
            logger?.log("❌ [Official API Search] Exception: ${e.localizedMessage}")
        }
        return list
    }

    private fun parseDurationStringToSeconds(durationStr: String): Int {
        if (durationStr.isEmpty()) return 0
        val parts = durationStr.split(":")
        return try {
            when (parts.size) {
                1 -> parts[0].toInt()
                2 -> parts[0].toInt() * 60 + parts[1].toInt()
                3 -> parts[0].toInt() * 3600 + parts[1].toInt() * 60 + parts[2].toInt()
                else -> 0
            }
        } catch (e: Exception) {
            0
        }
    }

    private fun parseViewsString(viewStr: String): Long {
        val clean = viewStr.lowercase().replace("[^0-9a-z.]".toRegex(), "")
        return try {
            if (clean.contains("billion") || clean.contains("b")) {
                (clean.replace("[^0-9.]".toRegex(), "").toDouble() * 1_000_000_000).toLong()
            } else if (clean.contains("million") || clean.contains("m")) {
                (clean.replace("[^0-9.]".toRegex(), "").toDouble() * 1_000_000).toLong()
            } else if (clean.contains("thousand") || clean.contains("k")) {
                (clean.replace("[^0-9.]".toRegex(), "").toDouble() * 1_000).toLong()
            } else {
                clean.replace("[^0-9]".toRegex(), "").toLong()
            }
        } catch (e: Exception) {
            0L
        }
    }

    private fun extractViaInnerTube(videoId: String, logger: Logger?): ExtractionResult? {
        val url = "https://www.youtube.com/youtubei/v1/player"
        
        // Define robust InnerTube client configurations (failover mechanism)
        val clients = listOf(
            Triple("ANDROID_VR", "1.36.0", "com.google.android.youtube/1.36.0 (Linux; U; Android 11) gzip"),
            Triple("ANDROID_TESTSUITE", "1.9", "com.google.android.youtube/1.9 (Linux; U; Android 11) gzip"),
            Triple("TVHTML5", "7.20230405.08.01", "Mozilla/5.0 (Chromecast; GoogleTV) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.225 Safari/537.36 Core/8.2021.5"),
            Triple("ANDROID", "17.31.35", "com.google.android.youtube/17.31.35 (Linux; U; Android 11; US) gzip"),
            Triple("WEB", "2.20210621.02.00", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36")
        )

        for ((clientName, clientVersion, userAgent) in clients) {
            try {
                logger?.log("🛠️ [Manual Extractor] Trying InnerTube client: $clientName ($clientVersion)...")
                val jsonPayload = JSONObject().apply {
                    put("videoId", videoId)
                    val context = JSONObject().apply {
                        val clientObj = JSONObject().apply {
                            put("clientName", clientName)
                            put("clientVersion", clientVersion)
                            put("hl", "en")
                            put("gl", "US")
                            if (clientName.startsWith("ANDROID")) {
                                put("androidSdkVersion", 30)
                            }
                        }
                        put("client", clientObj)
                    }
                    put("context", context)
                }

                val mediaType = "application/json; charset=utf-8".toMediaType()
                val body = jsonPayload.toString().toRequestBody(mediaType)

                val request = Request.Builder()
                    .url(url)
                    .post(body)
                    .header("User-Agent", userAgent)
                    .header("Content-Type", "application/json")
                    .build()

                client.newCall(request).execute().use { response ->
                    if (response.isSuccessful) {
                        val responseString = response.body?.string() ?: ""
                        val result = parsePlayerResponseJson(responseString, logger)
                        if (result != null && result.streams.isNotEmpty()) {
                            logger?.log("✅ [Manual Extractor] InnerTube client '$clientName' successfully extracted ${result.streams.size} stream(s)!")
                            return result
                        } else {
                            logger?.log("⚠️ [Manual Extractor] Client '$clientName' returned empty stream list (possible cipher or restriction).")
                        }
                    } else {
                        logger?.log("⚠️ [Manual Extractor] Client '$clientName' HTTP response failed: HTTP ${response.code}")
                    }
                }
            } catch (e: Exception) {
                logger?.log("⚠️ [Manual Extractor] Client '$clientName' error: ${e.localizedMessage}")
            }
        }
        return null
    }

    private fun extractViaWatchPage(videoId: String, logger: Logger?): ExtractionResult? {
        val watchUrl = "https://www.youtube.com/watch?v=${videoId}&bpctr=9999999999&has_verified=1"
        val request = Request.Builder()
            .url(watchUrl)
            .header("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36")
            .build()

        client.newCall(request).execute().use { response ->
            if (!response.isSuccessful) {
                logger?.log("❌ [Manual Extractor] Watch page response failed: HTTP ${response.code}")
                return null
            }
            val html = response.body?.string() ?: ""
            
            // Extract ytInitialPlayerResponse JSON using regex
            val regex = """ytInitialPlayerResponse\s*=\s*(\{.*?\});""".toRegex()
            val match = regex.find(html)
            if (match != null) {
                val jsonStr = match.groupValues[1]
                logger?.log("🛠️ [Manual Extractor] Found ytInitialPlayerResponse on page! Parsing stream info...")
                return parsePlayerResponseJson(jsonStr, logger)
            } else {
                logger?.log("❌ [Manual Extractor] Could not find ytInitialPlayerResponse in HTML page.")
            }
        }
        return null
    }

    private fun parsePlayerResponseJson(jsonString: String, logger: Logger?): ExtractionResult? {
        try {
            val root = JSONObject(jsonString)
            
            // Check playability status
            val playabilityStatus = root.optJSONObject("playabilityStatus")
            if (playabilityStatus != null) {
                val status = playabilityStatus.optString("status", "")
                if (status != "OK") {
                    val reason = playabilityStatus.optString("reason", "Unknown block")
                    logger?.log("⚠️ [Manual Extractor] Playability status was NOT OK: $status (Reason: $reason)")
                }
            }

            val videoDetails = root.optJSONObject("videoDetails")
            val title = videoDetails?.optString("title", "Unknown Title") ?: "Unknown Title"
            val durationSeconds = videoDetails?.optLong("lengthSeconds", 0L) ?: 0L

            val streamingData = root.optJSONObject("streamingData") ?: return null
            val streamsList = mutableListOf<ExtractedStream>()

            // 1. Regular progressive formats (video + audio in same stream)
            val formats = streamingData.optJSONArray("formats")
            if (formats != null) {
                for (i in 0 until formats.length()) {
                    val format = formats.getJSONObject(i)
                    val url = format.optString("url", "")
                    val quality = format.optString("qualityLabel", format.optString("quality", "360p"))
                    val mimeType = format.optString("mimeType", "")
                    if (url.isNotEmpty()) {
                        streamsList.add(ExtractedStream(url, quality, mimeType, isVideoOnly = false))
                    } else if (format.has("signatureCipher") || format.has("cipher")) {
                        logger?.log("🔒 [Manual Extractor] Stream requires signature deciphering, skipping standard URL.")
                    }
                }
            }

            // 2. Adaptive formats (high quality video-only streams)
            val adaptiveFormats = streamingData.optJSONArray("adaptiveFormats")
            if (adaptiveFormats != null) {
                for (i in 0 until adaptiveFormats.length()) {
                    val format = adaptiveFormats.getJSONObject(i)
                    val url = format.optString("url", "")
                    val quality = format.optString("qualityLabel", format.optString("quality", "audio"))
                    val mimeType = format.optString("mimeType", "")
                    val isVideo = mimeType.startsWith("video")
                    if (url.isNotEmpty()) {
                        streamsList.add(ExtractedStream(url, quality, mimeType, isVideoOnly = isVideo))
                    }
                }
            }

            return ExtractionResult(title, durationSeconds, streamsList)
        } catch (e: Exception) {
            logger?.log("❌ [Manual Extractor] JSON parsing exception: ${e.localizedMessage}")
            Log.e("YoutubeExtractor", "Error parsing player response", e)
        }
        return null
    }
}
