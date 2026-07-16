package com.example.api

import android.util.Log
import okhttp3.OkHttpClient
import okhttp3.Request
import org.json.JSONArray
import org.json.JSONObject
import java.io.IOException
import java.util.concurrent.TimeUnit

data class PipedSearchResult(
    val id: String,
    val title: String,
    val thumbnail: String,
    val uploader: String,
    val duration: Int,
    val views: Long,
    val uploadedString: String
)

data class PipedStreamInfo(
    val title: String,
    val description: String,
    val uploader: String,
    val thumbnailUrl: String,
    val videoStreams: List<PipedVideoStream>,
    val audioStreams: List<PipedAudioStream>
)

data class PipedVideoStream(
    val url: String,
    val quality: String,
    val mimeType: String,
    val isVideoOnly: Boolean
)

data class PipedAudioStream(
    val url: String,
    val mimeType: String,
    val bitrate: Int
)

class PipedApiClient {
    private val client = OkHttpClient.Builder()
        .connectTimeout(10, TimeUnit.SECONDS)
        .readTimeout(10, TimeUnit.SECONDS)
        .build()

    val instances = listOf(
        "https://pipedapi.kavin.rocks",
        "https://pipedapi.nosebs.ru",
        "https://pipedapi.leptons.xyz",
        "https://api.piped.yt",
        "https://pipedapi.privacy.com.de",
        "https://pipedapi.colby.moe",
        "https://pipedapi.adminforge.de",
        "https://pipedapi.swg.dev",
        "https://pipedapi.lre.yt",
        "https://pipedapi.hostux.net",
        "https://pipedapi.mha.fi",
        "https://pipedapi.projectsegfau.lt",
        "https://pipedapi.vepor.me",
        "https://pipedapi.sugishare.moe",
        "https://piped-api.garudalinux.org"
    )

    // Interface to log actions to our in-app terminal console
    interface Logger {
        fun log(message: String)
    }

    /**
     * Search videos with automatic failover across instances.
     */
    fun searchVideos(query: String, preferredInstanceIndex: Int, logger: Logger? = null): List<PipedSearchResult> {
        val orderedIndices = mutableListOf<Int>()
        // Put preferred instance first
        if (preferredInstanceIndex in instances.indices) {
            orderedIndices.add(preferredInstanceIndex)
        }
        for (i in instances.indices) {
            if (i != preferredInstanceIndex) {
                orderedIndices.add(i)
            }
        }

        for (index in orderedIndices) {
            val base = instances[index]
            logger?.log("🔍 [Search] Trying Piped instance ($index): $base")
            val url = "$base/search?q=${java.net.URLEncoder.encode(query, "UTF-8")}&filter=videos"
            try {
                val request = Request.Builder()
                    .url(url)
                    .header("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36")
                    .build()

                client.newCall(request).execute().use { response ->
                    if (!response.isSuccessful) {
                        logger?.log("❌ [Search] Failed on $base with status code ${response.code}")
                        return@use
                    }
                    val bodyString = response.body?.string() ?: ""
                    val results = parseSearchResults(bodyString)
                    logger?.log("✅ [Search] Successfully loaded ${results.size} videos from $base")
                    return results
                }
            } catch (e: Exception) {
                logger?.log("⚠️ [Search] Exception on $base: ${e.localizedMessage}")
            }
        }
        logger?.log("🚨 [Search] All Piped instances failed to return search results!")
        return emptyList()
    }

    /**
     * Fetch stream info with automatic failover across instances.
     */
    fun fetchStreamInfo(videoId: String, preferredInstanceIndex: Int, logger: Logger? = null): PipedStreamInfo? {
        val orderedIndices = mutableListOf<Int>()
        if (preferredInstanceIndex in instances.indices) {
            orderedIndices.add(preferredInstanceIndex)
        }
        for (i in instances.indices) {
            if (i != preferredInstanceIndex) {
                orderedIndices.add(i)
            }
        }

        for (index in orderedIndices) {
            val base = instances[index]
            logger?.log("📡 [Stream] Fetching stream info for $videoId from Piped instance $index: $base")
            val url = "$base/streams/$videoId"
            try {
                val request = Request.Builder()
                    .url(url)
                    .header("User-Agent", "Mozilla/5.0 (Android; Mobile; rv:100.0) Gecko/100.0 Firefox/100.0")
                    .build()

                client.newCall(request).execute().use { response ->
                    if (!response.isSuccessful) {
                        logger?.log("❌ [Stream] Failed on $base with status code ${response.code}")
                        return@use
                    }
                    val bodyString = response.body?.string() ?: ""
                    val info = parseStreamInfo(bodyString)
                    if (info != null) {
                        logger?.log("✅ [Stream] Stream URLs extracted successfully from $base!")
                        return info
                    } else {
                        logger?.log("⚠️ [Stream] Empty stream data from $base")
                    }
                }
            } catch (e: Exception) {
                logger?.log("⚠️ [Stream] Exception on $base: ${e.localizedMessage}")
            }
        }
        logger?.log("🚨 [Stream] All Piped instances failed to fetch stream info!")
        return null
    }

    private fun parseSearchResults(jsonStr: String): List<PipedSearchResult> {
        val list = mutableListOf<PipedSearchResult>()
        try {
            val arr = JSONArray(jsonStr)
            for (i in 0 until arr.length()) {
                val item = arr.getJSONObject(i)
                val type = item.optString("type", "")
                if (type == "video") {
                    val url = item.optString("url", "")
                    // URL is usually like /watch?v=VIDEO_ID
                    val id = url.substringAfter("v=", url)
                    val title = item.optString("title", "Unknown Title")
                    val thumbnail = item.optString("thumbnail", "")
                    val uploader = item.optString("uploaderName", item.optString("uploader", "Unknown Channel"))
                    val duration = item.optInt("duration", 0)
                    val views = item.optLong("views", 0L)
                    val uploadedString = item.optString("uploadedString", "")
                    list.add(PipedSearchResult(id, title, thumbnail, uploader, duration, views, uploadedString))
                }
            }
        } catch (e: Exception) {
            Log.e("PipedApiClient", "Error parsing search results", e)
        }
        return list
    }

    private fun parseStreamInfo(jsonStr: String): PipedStreamInfo? {
        try {
            val obj = JSONObject(jsonStr)
            val title = obj.optString("title", "Unknown Video")
            val description = obj.optString("description", "")
            val uploader = obj.optString("uploader", "")
            val thumbnailUrl = obj.optString("thumbnailUrl", "")

            val videoStreams = mutableListOf<PipedVideoStream>()
            val videoArr = obj.optJSONArray("videoStreams")
            if (videoArr != null) {
                for (i in 0 until videoArr.length()) {
                    val vObj = videoArr.getJSONObject(i)
                    val url = vObj.optString("url", "")
                    val quality = vObj.optString("quality", "Unknown")
                    val mimeType = vObj.optString("mimeType", "")
                    val videoOnly = vObj.optBoolean("videoOnly", false)
                    if (url.isNotEmpty()) {
                        videoStreams.add(PipedVideoStream(url, quality, mimeType, videoOnly))
                    }
                }
            }

            val audioStreams = mutableListOf<PipedAudioStream>()
            val audioArr = obj.optJSONArray("audioStreams")
            if (audioArr != null) {
                for (i in 0 until audioArr.length()) {
                    val aObj = audioArr.getJSONObject(i)
                    val url = aObj.optString("url", "")
                    val mimeType = aObj.optString("mimeType", "")
                    val bitrate = aObj.optInt("bitrate", 0)
                    if (url.isNotEmpty()) {
                        audioStreams.add(PipedAudioStream(url, mimeType, bitrate))
                    }
                }
            }

            return PipedStreamInfo(title, description, uploader, thumbnailUrl, videoStreams, audioStreams)
        } catch (e: Exception) {
            Log.e("PipedApiClient", "Error parsing stream info", e)
        }
        return null
    }
}
// Helper annotation for failover loop
private inline val Any.cooperativeContinue: Unit get() = Unit
