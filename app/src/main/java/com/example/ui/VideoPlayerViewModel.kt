package com.example.ui

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.api.PipedApiClient
import com.example.api.PipedSearchResult
import com.example.extraction.YoutubeExtractor
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

enum class SearchStrategy {
    SCRAPER,    // Client-side Direct Web Scraping (Resilient, no keys needed)
    PIPED,      // Piped API endpoints
    OFFICIAL    // Official YouTube Data API v3 (Using user API Key)
}

data class PlayerUiState(
    val searchQuery: String = "nature relaxation",
    val searchResults: List<PipedSearchResult> = emptyList(),
    val isLoading: Boolean = false,
    val isLoadingMore: Boolean = false,
    val continuationToken: String? = null,
    val selectedVideo: PipedSearchResult? = null,
    val activeStreamUrl: String? = null,
    val activeStreamSource: String? = null, // "Manual Extraction" or "Piped Fallback"
    val useWebViewFallback: Boolean = false, // True if we need to load WebView-based embed
    val logs: List<String> = emptyList(),
    val forceManualFail: Boolean = false, // Setting to test fallback behavior
    val preferredInstanceIndex: Int = 0, // 0: kavin.rocks, 1: nosebs.ru, 2: leptons.xyz
    val searchStrategy: SearchStrategy = SearchStrategy.SCRAPER, // Default to Scraper for maximum stability
    val userApiKey: String = ""
)

class VideoPlayerViewModel : ViewModel() {
    private val _uiState = MutableStateFlow(PlayerUiState())
    val uiState: StateFlow<PlayerUiState> = _uiState.asStateFlow()

    private val pipedClient = PipedApiClient()
    private val youtubeExtractor = YoutubeExtractor()

    init {
        addLog("🚀 App started. System ready.")
        addLog("🔗 Loaded Piped APIs:")
        pipedClient.instances.forEachIndexed { i, url ->
            addLog("  [$i] $url")
        }
        addLog("⚡ Primary Search Strategy: SCRAPER (resilient client-side scraping)")
        
        // Auto-detect the fastest Piped instance in the background on startup!
        autoDetectFastestInstance()
        
        // Run initial search so the app isn't empty on launch
        performSearch()
    }

    fun autoDetectFastestInstance() {
        viewModelScope.launch(Dispatchers.IO) {
            viewModelScope.launch { addLog("🔎 [Auto-Config] Testing Piped instances for speed and availability...") }
            val instances = pipedClient.instances
            var foundIndex = -1
            
            // Use a clean, fast client with a very short timeout
            val testClient = okhttp3.OkHttpClient.Builder()
                .connectTimeout(2500, java.util.concurrent.TimeUnit.MILLISECONDS)
                .readTimeout(2500, java.util.concurrent.TimeUnit.MILLISECONDS)
                .build()

            for (i in instances.indices) {
                val base = instances[i]
                val testUrl = "$base/search?q=test&filter=videos"
                try {
                    val request = okhttp3.Request.Builder()
                        .url(testUrl)
                        .build()
                    testClient.newCall(request).execute().use { response ->
                        if (response.isSuccessful) {
                            foundIndex = i
                            viewModelScope.launch { addLog("⚡ [Auto-Config] Success! Instance [$i] $base is active and fast.") }
                        }
                    }
                } catch (e: Exception) {
                    // Silent fail
                }
                if (foundIndex != -1) break
            }

            if (foundIndex != -1) {
                val activeIndex = foundIndex
                withContext(Dispatchers.Main) {
                    _uiState.value = _uiState.value.copy(preferredInstanceIndex = activeIndex)
                    addLog("🎉 [Auto-Config] Automatically configured preferred instance to [$activeIndex] ${instances[activeIndex]}")
                }
            } else {
                viewModelScope.launch { addLog("⚠️ [Auto-Config] Health-check complete. Reverting to default [0].") }
            }
        }
    }

    fun updateSearchQuery(query: String) {
        _uiState.value = _uiState.value.copy(searchQuery = query)
    }

    fun toggleForceManualFail() {
        val newVal = !_uiState.value.forceManualFail
        _uiState.value = _uiState.value.copy(forceManualFail = newVal)
        addLog("⚙️ Force Manual Extraction failure toggled to: $newVal")
    }

    fun updatePreferredInstance(index: Int) {
        if (index in pipedClient.instances.indices) {
            _uiState.value = _uiState.value.copy(preferredInstanceIndex = index)
            addLog("⚙️ Preferred Piped instance set to: [${index}] ${pipedClient.instances[index]}")
        }
    }

    fun updateSearchStrategy(strategy: SearchStrategy) {
        _uiState.value = _uiState.value.copy(searchStrategy = strategy)
        addLog("⚙️ Search strategy changed to: $strategy")
    }

    fun updateApiKey(key: String) {
        _uiState.value = _uiState.value.copy(userApiKey = key)
        addLog("⚙️ YouTube Data API v3 Key updated (Length: ${key.length} chars)")
    }

    fun addLog(message: String) {
        val timestamp = SimpleDateFormat("HH:mm:ss", Locale.getDefault()).format(Date())
        val loggedText = "[$timestamp] $message"
        _uiState.value = _uiState.value.copy(
            logs = _uiState.value.logs + loggedText
        )
    }

    fun clearLogs() {
        _uiState.value = _uiState.value.copy(logs = emptyList())
        addLog("🧹 Log terminal cleared.")
    }

    fun performSearch() {
        val query = _uiState.value.searchQuery.trim()
        if (query.isEmpty()) {
            addLog("⚠️ Search query is empty.")
            return
        }

        _uiState.value = _uiState.value.copy(isLoading = true, searchResults = emptyList(), continuationToken = null)
        addLog("🔎 Searching for: \"$query\" using [${_uiState.value.searchStrategy}]")

        viewModelScope.launch(Dispatchers.IO) {
            val strategy = _uiState.value.searchStrategy
            val apiKey = _uiState.value.userApiKey.trim()
            
            var results: List<PipedSearchResult> = emptyList()
            var token: String? = null
            
            val loggerObj = object : YoutubeExtractor.Logger {
                override fun log(message: String) {
                    viewModelScope.launch { addLog(message) }
                }
            }

            // Execute primary search strategy
            when (strategy) {
                SearchStrategy.OFFICIAL -> {
                    if (apiKey.isEmpty()) {
                        viewModelScope.launch { addLog("⚠️ YouTube API Key is empty! Falling back to Web Scraper Search.") }
                        val pair = youtubeExtractor.searchVideosDirectWithContinuation(query, null, loggerObj)
                        results = pair.first
                        token = pair.second
                    } else {
                        results = youtubeExtractor.searchVideosWithKey(query, apiKey, loggerObj)
                    }
                }
                SearchStrategy.SCRAPER -> {
                    val pair = youtubeExtractor.searchVideosDirectWithContinuation(query, null, loggerObj)
                    results = pair.first
                    token = pair.second
                }
                SearchStrategy.PIPED -> {
                    results = pipedClient.searchVideos(
                        query = query,
                        preferredInstanceIndex = _uiState.value.preferredInstanceIndex,
                        logger = object : PipedApiClient.Logger {
                            override fun log(message: String) {
                                viewModelScope.launch { addLog(message) }
                            }
                        }
                    )
                }
            }

            // Auto-Failover if results are empty!
            if (results.isEmpty()) {
                if (strategy != SearchStrategy.SCRAPER) {
                    viewModelScope.launch { addLog("🔄 [Auto-Failover] Trying Direct Web Scraper Search...") }
                    val pair = youtubeExtractor.searchVideosDirectWithContinuation(query, null, loggerObj)
                    results = pair.first
                    token = pair.second
                }
                if (results.isEmpty() && strategy != SearchStrategy.PIPED) {
                    viewModelScope.launch { addLog("🔄 [Auto-Failover] Trying Piped API search fallback...") }
                    results = pipedClient.searchVideos(
                        query = query,
                        preferredInstanceIndex = _uiState.value.preferredInstanceIndex,
                        logger = object : PipedApiClient.Logger {
                            override fun log(message: String) {
                                viewModelScope.launch { addLog(message) }
                            }
                        }
                    )
                }
            }

            withContext(Dispatchers.Main) {
                _uiState.value = _uiState.value.copy(
                    searchResults = results,
                    continuationToken = token,
                    isLoading = false
                )
                if (results.isEmpty()) {
                    addLog("🚨 All search methods failed to return results. Try another term or switch preferred instance.")
                } else {
                    addLog("🎉 Loaded ${results.size} search results successfully!")
                }
            }
        }
    }

    fun loadMoreVideos() {
        val state = _uiState.value
        val continuation = state.continuationToken
        if (state.isLoading || state.isLoadingMore || continuation.isNullOrEmpty()) {
            return
        }

        _uiState.value = _uiState.value.copy(isLoadingMore = true)
        addLog("📡 [Infinite Scroll] Loading next batch of videos from YouTube...")

        viewModelScope.launch(Dispatchers.IO) {
            val loggerObj = object : YoutubeExtractor.Logger {
                override fun log(message: String) {
                    viewModelScope.launch { addLog(message) }
                }
            }

            try {
                val (newVideos, nextToken) = youtubeExtractor.searchVideosDirectWithContinuation(
                    query = state.searchQuery,
                    continuationToken = continuation,
                    logger = loggerObj
                )

                withContext(Dispatchers.Main) {
                    if (newVideos.isNotEmpty()) {
                        _uiState.value = _uiState.value.copy(
                            searchResults = _uiState.value.searchResults + newVideos,
                            continuationToken = nextToken,
                            isLoadingMore = false
                        )
                        addLog("🎉 [Infinite Scroll] Success! Appended ${newVideos.size} videos. Total: ${_uiState.value.searchResults.size}")
                    } else {
                        _uiState.value = _uiState.value.copy(
                            continuationToken = null, // clear to avoid infinite attempts
                            isLoadingMore = false
                        )
                        addLog("⚠️ [Infinite Scroll] No more videos found in next page.")
                    }
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    _uiState.value = _uiState.value.copy(isLoadingMore = false)
                    addLog("❌ [Infinite Scroll] Error: ${e.localizedMessage}")
                }
            }
        }
    }

    fun selectAndPlayVideo(video: PipedSearchResult) {
        _uiState.value = _uiState.value.copy(
            selectedVideo = video,
            activeStreamUrl = null,
            activeStreamSource = null,
            useWebViewFallback = false,
            isLoading = true
        )
        addLog("🖱️ Selected: \"${video.title}\" (${video.id})")

        viewModelScope.launch(Dispatchers.IO) {
            var streamUrlToPlay: String? = null
            var finalSource: String? = null

            // 1. Check if user forced manual extraction to fail for demonstration/testing
            if (_uiState.value.forceManualFail) {
                viewModelScope.launch { addLog("⚠️ [Demonstration Mode] Manual extraction bypassed/forced to fail!") }
            } else {
                // Try Manual Extraction first
                try {
                    val result = youtubeExtractor.extractVideo(video.id, object : YoutubeExtractor.Logger {
                        override fun log(message: String) {
                            viewModelScope.launch { addLog(message) }
                        }
                    })

                    // Pick the first available video+audio format or progressive format
                    val chosenStream = result.streams.firstOrNull { !it.isVideoOnly } 
                        ?: result.streams.firstOrNull()

                    if (chosenStream != null) {
                        streamUrlToPlay = chosenStream.url
                        finalSource = "Manual Extraction (${chosenStream.quality})"
                        viewModelScope.launch { addLog("⚡ Success! Manual direct stream obtained. Quality: ${chosenStream.quality}") }
                    } else {
                        viewModelScope.launch { addLog("⚠️ Manual extraction didn't yield any suitable stream formats.") }
                    }
                } catch (e: Exception) {
                    viewModelScope.launch { addLog("❌ Manual extraction failed: ${e.localizedMessage}") }
                }
            }

            // 2. FALLBACK to Piped API Extraction
            if (streamUrlToPlay == null) {
                viewModelScope.launch { addLog("🔄 [Fallback] Starting Piped API fallback retrieval...") }
                
                val streamInfo = pipedClient.fetchStreamInfo(
                    videoId = video.id,
                    preferredInstanceIndex = _uiState.value.preferredInstanceIndex,
                    logger = object : PipedApiClient.Logger {
                        override fun log(message: String) {
                            viewModelScope.launch { addLog(message) }
                        }
                    }
                )

                if (streamInfo != null) {
                    // Try to find a good progressive format or standard video stream
                    val stream = streamInfo.videoStreams.firstOrNull { !it.isVideoOnly }
                        ?: streamInfo.videoStreams.firstOrNull()
                    
                    if (stream != null) {
                        streamUrlToPlay = stream.url
                        finalSource = "Piped Fallback API (${stream.quality})"
                        viewModelScope.launch { addLog("⚡ Success! Fallback stream url loaded. Quality: ${stream.quality}") }
                    } else {
                        viewModelScope.launch { addLog("🚨 Fallback stream returned from API but no valid formats found.") }
                    }
                } else {
                    viewModelScope.launch { addLog("🚨 [Critical] All extraction paths and fallback APIs failed for this video!") }
                }
            }

            withContext(Dispatchers.Main) {
                val shouldFallback = (streamUrlToPlay == null)
                _uiState.value = _uiState.value.copy(
                    activeStreamUrl = streamUrlToPlay,
                    activeStreamSource = finalSource ?: if (shouldFallback) "Official Embed fallback" else null,
                    useWebViewFallback = shouldFallback,
                    isLoading = false
                )
                if (streamUrlToPlay == null) {
                    addLog("🔄 [Fallback] Activated seamless Official YouTube Embed fallback player successfully!")
                } else {
                    addLog("🎬 Starting media playback via ExoPlayer. Stream source: $finalSource")
                }
            }
        }
    }

    fun playDirectId(videoId: String) {
        val trimmedId = videoId.trim()
        if (trimmedId.isEmpty()) {
            addLog("⚠️ Direct Play: video URL/ID is empty.")
            return
        }
        val resolvedId = extractVideoId(trimmedId)
        addLog("🔗 Direct Play initiated for Video ID: $resolvedId")
        
        // Create a temporary result item
        val dummyResult = PipedSearchResult(
            id = resolvedId,
            title = "Direct Video Play ($resolvedId)",
            thumbnail = "https://img.youtube.com/vi/$resolvedId/0.jpg",
            uploader = "YouTube Direct",
            duration = 0,
            views = 0L,
            uploadedString = "Live URL"
        )
        selectAndPlayVideo(dummyResult)
    }

    private fun extractVideoId(input: String): String {
        // If it's already a clean ID
        if (input.length == 11 && !input.contains("/") && !input.contains("?")) {
            return input
        }
        // Check for youtube.com/watch?v=ID
        val watchRegex = "v=([a-zA-Z0-9_-]{11})".toRegex()
        val watchMatch = watchRegex.find(input)
        if (watchMatch != null) {
            return watchMatch.groupValues[1]
        }
        // Check for youtu.be/ID
        val beRegex = "youtu\\.be/([a-zA-Z0-9_-]{11})".toRegex()
        val beMatch = beRegex.find(input)
        if (beMatch != null) {
            return beMatch.groupValues[1]
        }
        // Check for youtube.com/embed/ID
        val embedRegex = "embed/([a-zA-Z0-9_-]{11})".toRegex()
        val embedMatch = embedRegex.find(input)
        if (embedMatch != null) {
            return embedMatch.groupValues[1]
        }
        return input // return input as fallback
    }
}
