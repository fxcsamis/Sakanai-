package com.example.ui.components

import androidx.annotation.OptIn
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.viewinterop.AndroidView
import androidx.media3.common.MediaItem
import androidx.media3.common.PlaybackException
import androidx.media3.common.Player
import androidx.media3.common.util.UnstableApi
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.ui.PlayerView

@OptIn(UnstableApi::class)
@Composable
fun VideoPlayer(
    videoUrl: String,
    onPlaybackError: (String) -> Unit,
    onPlaybackStateChanged: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    var isBuffering by remember { mutableStateOf(true) }
    var errorMessage by remember { mutableStateOf<String?>(null) }

    val exoPlayer = remember {
        ExoPlayer.Builder(context).build().apply {
            playWhenReady = true
        }
    }

    // Set up player listener
    DisposableEffect(exoPlayer) {
        val listener = object : Player.Listener {
            override fun onPlaybackStateChanged(state: Int) {
                val stateStr = when (state) {
                    Player.STATE_IDLE -> "IDLE"
                    Player.STATE_BUFFERING -> {
                        isBuffering = true
                        "BUFFERING"
                    }
                    Player.STATE_READY -> {
                        isBuffering = false
                        "READY"
                    }
                    Player.STATE_ENDED -> {
                        isBuffering = false
                        "ENDED"
                    }
                    else -> "UNKNOWN"
                }
                onPlaybackStateChanged(stateStr)
            }

            override fun onPlayerError(error: PlaybackException) {
                isBuffering = false
                val desc = error.localizedMessage ?: "ExoPlayer playback error"
                errorMessage = desc
                onPlaybackError(desc)
            }
        }
        exoPlayer.addListener(listener)
        onDispose {
            exoPlayer.removeListener(listener)
            exoPlayer.release()
        }
    }

    // Handle video URL updates
    LaunchedEffect(videoUrl) {
        errorMessage = null
        isBuffering = true
        val mediaItem = MediaItem.fromUri(videoUrl)
        exoPlayer.setMediaItem(mediaItem)
        exoPlayer.prepare()
        exoPlayer.play()
    }

    Box(
        modifier = modifier.background(Color.Black),
        contentAlignment = Alignment.Center
    ) {
        AndroidView(
            factory = { ctx ->
                PlayerView(ctx).apply {
                    player = exoPlayer
                    useController = true
                    // Set custom aspect ratio or properties if needed
                }
            },
            modifier = Modifier.fillMaxSize()
        )

        if (isBuffering && errorMessage == null) {
            CircularProgressIndicator(color = Color.White)
        }

        errorMessage?.let { error ->
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(Color.Black.copy(alpha = 0.8f)),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = "Playback Error:\n$error",
                    color = Color.Red,
                    modifier = Modifier.background(Color.Black)
                )
            }
        }
    }
}

@Composable
fun YoutubeWebViewPlayer(
    videoId: String,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val webView = remember(videoId) {
        android.webkit.WebView(context).apply {
            settings.javaScriptEnabled = true
            settings.mediaPlaybackRequiresUserGesture = false
            settings.domStorageEnabled = true
            settings.useWideViewPort = true
            settings.loadWithOverviewMode = true
            
            // Set dark/transparent background
            setBackgroundColor(0)
            
            webViewClient = android.webkit.WebViewClient()
            webChromeClient = android.webkit.WebChromeClient()
            
            // Generate clean responsive YouTube Iframe responsive embed code
            val html = """
                <!DOCTYPE html>
                <html>
                <head>
                    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
                    <style>
                        body, html {
                            margin: 0;
                            padding: 0;
                            width: 100%;
                            height: 100%;
                            background-color: #000000;
                            overflow: hidden;
                        }
                        iframe {
                            width: 100%;
                            height: 100%;
                            border: none;
                        }
                    </style>
                </head>
                <body>
                    <div id="player"></div>
                    <script>
                        var tag = document.createElement('script');
                        tag.src = "https://www.youtube.com/iframe_api";
                        var firstScriptTag = document.getElementsByTagName('script')[0];
                        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

                        var player;
                        function onYouTubeIframeAPIReady() {
                            player = new YT.Player('player', {
                                height: '100%',
                                width: '100%',
                                videoId: '$videoId',
                                playerVars: {
                                    'autoplay': 1,
                                    'playsinline': 1,
                                    'rel': 0,
                                    'modestbranding': 1,
                                    'controls': 1,
                                    'fs': 1,
                                    'showinfo': 0,
                                    'iv_load_policy': 3
                                },
                                events: {
                                    'onReady': onPlayerReady
                                }
                            });
                        }

                        function onPlayerReady(event) {
                            event.target.playVideo();
                        }
                    </script>
                </body>
                </html>
            """.trimIndent()
            
            loadDataWithBaseURL("https://www.youtube.com", html, "text/html", "UTF-8", null)
        }
    }

    DisposableEffect(webView) {
        onDispose {
            webView.stopLoading()
            webView.destroy()
        }
    }

    AndroidView(
        factory = { webView },
        modifier = modifier.background(Color.Black)
    )
}

