package com.example

import android.content.Context
import androidx.test.core.app.ApplicationProvider
import com.example.ui.VideoPlayerViewModel
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.RequestBody.Companion.toRequestBody
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [36])
class ExampleRobolectricTest {

  @Test
  fun `read string from context`() {
    val context = ApplicationProvider.getApplicationContext<Context>()
    val appName = context.getString(R.string.app_name)
    assertEquals("YouTube Clone", appName)
  }

  @Test
  fun `test viewModel default state`() {
    val viewModel = VideoPlayerViewModel()
    val state = viewModel.uiState.value
    assertEquals("nature relaxation", state.searchQuery)
    assertFalse(state.forceManualFail)
    assertEquals(0, state.preferredInstanceIndex)
    assertTrue(state.logs.isNotEmpty()) // System logs initialized
  }

  @Test
  fun `test viewModel configuration triggers`() {
    val viewModel = VideoPlayerViewModel()
    viewModel.toggleForceManualFail()
    assertTrue(viewModel.uiState.value.forceManualFail)

    viewModel.updatePreferredInstance(2)
    assertEquals(2, viewModel.uiState.value.preferredInstanceIndex)
  }

  @Test
  fun `testDirectSearch`() {
    val extractor = com.example.extraction.YoutubeExtractor()
    val logger = object : com.example.extraction.YoutubeExtractor.Logger {
      override fun log(message: String) {
        println("TEST_LOG: $message")
      }
    }
    val results = extractor.searchVideosDirect("nature relaxation", logger)
    println("TEST_RESULTS_SIZE: ${results.size}")
    results.forEach {
      println("VIDEO_FOUND: ${it.title} (${it.id}) - ${it.uploader}")
    }
  }

  @Test
  fun `testPipedSearch`() {
    val client = com.example.api.PipedApiClient()
    val logger = object : com.example.api.PipedApiClient.Logger {
      override fun log(message: String) {
        println("PIPED_TEST_LOG: $message")
      }
    }
    val results = client.searchVideos("nature relaxation", 0, logger)
    println("PIPED_TEST_RESULTS_SIZE: ${results.size}")
  }

  @Test
  fun `testInnerTubeSearch`() {
    val url = "https://www.youtube.com/youtubei/v1/search"
    val jsonPayload = org.json.JSONObject().apply {
      val context = org.json.JSONObject().apply {
        val clientObj = org.json.JSONObject().apply {
          put("clientName", "WEB")
          put("clientVersion", "2.20210621.02.00")
          put("hl", "en")
          put("gl", "US")
        }
        put("client", clientObj)
      }
      put("context", context)
      put("query", "nature relaxation")
    }

    val mediaType = "application/json; charset=utf-8".toMediaType()
    val body = jsonPayload.toString().toRequestBody(mediaType)
    val request = okhttp3.Request.Builder()
        .url(url)
        .post(body)
        .header("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36")
        .header("Content-Type", "application/json")
        .build()

    val client = okhttp3.OkHttpClient.Builder()
        .connectTimeout(15, java.util.concurrent.TimeUnit.SECONDS)
        .readTimeout(15, java.util.concurrent.TimeUnit.SECONDS)
        .build()

    client.newCall(request).execute().use { response ->
      assertTrue(response.isSuccessful)
      val responseString = response.body?.string() ?: ""
      val json = org.json.JSONObject(responseString)
      
      val renderers = mutableListOf<org.json.JSONObject>()
      fun findVideoRenderers(value: Any) {
        if (value is org.json.JSONObject) {
          if (value.has("videoRenderer")) {
            value.optJSONObject("videoRenderer")?.let { renderers.add(it) }
          }
          val keys = value.keys()
          while (keys.hasNext()) {
            val key = keys.next()
            findVideoRenderers(value.get(key))
          }
        } else if (value is org.json.JSONArray) {
          for (i in 0 until value.length()) {
            findVideoRenderers(value.get(i))
          }
        }
      }

      findVideoRenderers(json)
      println("FOUND_INNER_TUBE_RENDERERS: ${renderers.size}")
      assertTrue(renderers.isNotEmpty())
      
      renderers.take(5).forEach { videoObj ->
        val videoId = videoObj.optString("videoId", "")
        val titleObj = videoObj.optJSONObject("title")
        val title = titleObj?.optJSONArray("runs")?.optJSONObject(0)?.optString("text")
            ?: titleObj?.optString("simpleText", "Unknown")
            ?: "Unknown"
        println("INNER_TUBE_VIDEO: $title ($videoId)")
      }
    }
  }

  @Test
  fun `testStreamExtraction`() {
    val videoId = "hlWiI4xVXKY" // Soothing Relaxation piano music
    val url = "https://www.youtube.com/youtubei/v1/player"

    val clients = listOf(
      "TVHTML5" to "7.20230405.08.00",
      "IOS" to "17.33.2",
      "WEB_EMBEDDED_PLAYER" to "1.20210621.02.00",
      "ANDROID" to "17.31.35"
    )

    val client = okhttp3.OkHttpClient.Builder()
        .connectTimeout(15, java.util.concurrent.TimeUnit.SECONDS)
        .readTimeout(15, java.util.concurrent.TimeUnit.SECONDS)
        .build()

    for ((clientName, clientVersion) in clients) {
      println("--- TRYING CLIENT: $clientName ($clientVersion) ---")
      val jsonPayload = org.json.JSONObject().apply {
        put("videoId", videoId)
        val context = org.json.JSONObject().apply {
          val clientObj = org.json.JSONObject().apply {
            put("clientName", clientName)
            put("clientVersion", clientVersion)
            put("hl", "en")
            put("gl", "US")
            if (clientName == "TVHTML5") {
              put("ua", "Mozilla/5.0 (Chromecast; GoogleTV) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.225 Safari/537.36")
            }
          }
          put("client", clientObj)
        }
        put("context", context)
      }

      val mediaType = "application/json; charset=utf-8".toMediaType()
      val body = jsonPayload.toString().toRequestBody(mediaType)
      val request = okhttp3.Request.Builder()
          .url(url)
          .post(body)
          .header("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64)")
          .header("Content-Type", "application/json")
          .build()

      try {
        client.newCall(request).execute().use { response ->
          val responseString = response.body?.string() ?: ""
          val json = org.json.JSONObject(responseString)
          val playabilityStatus = json.optJSONObject("playabilityStatus")
          val status = playabilityStatus?.optString("status", "UNKNOWN")
          val reason = playabilityStatus?.optString("reason", "None")
          println("CLIENT $clientName STATUS: $status (Reason: $reason)")
          
          val streamingData = json.optJSONObject("streamingData")
          println("CLIENT $clientName STREAMING DATA: ${streamingData != null}")
          if (streamingData != null) {
            val formats = streamingData.optJSONArray("formats")
            println("CLIENT $clientName PROGRESSIVE STREAMS: ${formats?.length() ?: 0}")
            if (formats != null && formats.length() > 0) {
              val first = formats.getJSONObject(0)
              println("CLIENT $clientName STREAM URL: ${first.optString("url").take(100)}")
            }
          }
        }
      } catch (e: Exception) {
        println("CLIENT $clientName EXCEPTION: ${e.message}")
      }
    }
    
    println("--- TRYING WATCH PAGE SCRAPER ---")
    val extractor = com.example.extraction.YoutubeExtractor()
    val logger = object : com.example.extraction.YoutubeExtractor.Logger {
      override fun log(message: String) {
        println("SCRAPER_LOG: $message")
      }
    }
    try {
      val res = extractor.extractVideo(videoId, logger)
      println("SCRAPER STREAMS FOUND: ${res.streams.size}")
      res.streams.forEach {
        println("SCRAPER_STREAM: Quality=${it.quality}, Mime=${it.mimeType}, IsVideoOnly=${it.isVideoOnly}")
      }
    } catch (e: Exception) {
      println("SCRAPER EXCEPTION: ${e.message}")
    }
  }

  @Test
  fun `testInvidiousStreamExtraction`() {
    val videoId = "hlWiI4xVXKY"
    val instances = listOf(
      "https://yewtu.be",
      "https://invidious.projectsegfau.lt",
      "https://inv.vern.cc"
    )

    val client = okhttp3.OkHttpClient.Builder()
        .connectTimeout(15, java.util.concurrent.TimeUnit.SECONDS)
        .readTimeout(15, java.util.concurrent.TimeUnit.SECONDS)
        .build()

    for (base in instances) {
      println("--- TRYING INVIDIOUS: $base ---")
      val url = "$base/api/v1/videos/$videoId"
      val request = okhttp3.Request.Builder()
          .url(url)
          .build()

      try {
        client.newCall(request).execute().use { response ->
          val responseString = response.body?.string() ?: ""
          println("INVIDIOUS $base CODE: ${response.code}")
          if (response.isSuccessful) {
            val json = org.json.JSONObject(responseString)
            val title = json.optString("title", "Unknown")
            println("INVIDIOUS VIDEO TITLE: $title")
            
            val formatStreams = json.optJSONArray("formatStreams")
            println("INVIDIOUS formatStreams count: ${formatStreams?.length() ?: 0}")
            if (formatStreams != null && formatStreams.length() > 0) {
              for (i in 0 until formatStreams.length()) {
                val f = formatStreams.getJSONObject(i)
                println("STREAM [$i]: Quality=${f.optString("qualityLabel")}, Container=${f.optString("container")}, HasURL=${f.optString("url").isNotEmpty()}")
              }
            }
          }
        }
      } catch (e: Exception) {
        println("INVIDIOUS $base EXCEPTION: ${e.message}")
      }
    }
  }
}
