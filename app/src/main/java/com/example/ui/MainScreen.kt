package com.example.ui

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.BugReport
import androidx.compose.material.icons.filled.Bolt
import androidx.compose.material.icons.filled.Clear
import androidx.compose.material.icons.filled.Cloud
import androidx.compose.material.icons.filled.Code
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.Terminal
import androidx.compose.material.icons.filled.Tv
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ExposedDropdownMenuBox
import androidx.compose.material3.ExposedDropdownMenuDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Switch
import androidx.compose.material3.SwitchDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.derivedStateOf
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalSoftwareKeyboardController
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.example.api.PipedSearchResult
import com.example.ui.components.VideoPlayer
import com.example.ui.components.YoutubeWebViewPlayer
import com.example.ui.SearchStrategy

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MainScreen(
    viewModel: VideoPlayerViewModel,
    modifier: Modifier = Modifier
) {
    val state by viewModel.uiState.collectAsState()
    val keyboardController = LocalSoftwareKeyboardController.current

    // Colors aligned to YouTube Dark Mode theme
    val backgroundColor = Color(0xFF0F0F0F)
    val cardColor = Color(0xFF1F1F1F)
    val terminalColor = Color(0xFF151515)
    val terminalGreen = Color(0xFF39FF14)
    val terminalAmber = Color(0xFFFFB300)
    val terminalCyan = Color(0xFF00E5FF)

    Scaffold(
        modifier = modifier.fillMaxSize(),
        containerColor = backgroundColor
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Header / App Title
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(
                    imageVector = Icons.Filled.Tv,
                    contentDescription = "App Logo",
                    tint = MaterialTheme.colorScheme.primary,
                    modifier = Modifier.size(32.dp)
                )
                Spacer(modifier = Modifier.width(12.dp))
                Column {
                    Text(
                        text = "YouTube Clone",
                        color = Color.White,
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Bold,
                        letterSpacing = 1.sp
                    )
                    Text(
                        text = "Powered by NewPipe extraction algorithm & multi-engine failover",
                        color = Color.Gray,
                        fontSize = 11.sp
                    )
                }
            }

            // Controls: Input URLs or IDs and Search Query
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Search Input Box
                OutlinedTextField(
                    value = state.searchQuery,
                    onValueChange = { viewModel.updateSearchQuery(it) },
                    label = { Text("Search YouTube or Paste URL", color = Color.Gray) },
                    modifier = Modifier.weight(1f),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = MaterialTheme.colorScheme.primary,
                        unfocusedBorderColor = Color.DarkGray,
                        focusedContainerColor = cardColor,
                        unfocusedContainerColor = cardColor
                    ),
                    textStyle = androidx.compose.ui.text.TextStyle(color = Color.White),
                    singleLine = true,
                    keyboardOptions = KeyboardOptions(imeAction = ImeAction.Search),
                    keyboardActions = KeyboardActions(onSearch = {
                        keyboardController?.hide()
                        viewModel.performSearch()
                    }),
                    trailingIcon = {
                        if (state.searchQuery.isNotEmpty()) {
                            IconButton(onClick = { viewModel.updateSearchQuery("") }) {
                                Icon(Icons.Filled.Clear, "Clear Search", tint = Color.Gray)
                            }
                        }
                    }
                )

                // Quick Play/Search button
                Button(
                    onClick = {
                        keyboardController?.hide()
                        val q = state.searchQuery.trim()
                        if (q.startsWith("http") || q.length == 11) {
                            viewModel.playDirectId(q)
                        } else {
                            viewModel.performSearch()
                        }
                    },
                    modifier = Modifier.height(56.dp),
                    shape = RoundedCornerShape(8.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = MaterialTheme.colorScheme.primary
                    )
                ) {
                    val isLink = state.searchQuery.trim().startsWith("http") || state.searchQuery.trim().length == 11
                    Icon(
                        imageVector = if (isLink) Icons.Filled.PlayArrow else Icons.Filled.Search,
                        contentDescription = "Action"
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(if (isLink) "PLAY" else "SEARCH")
                }
            }

            // Engine Strategy & Preferences Card
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(cardColor, shape = RoundedCornerShape(8.dp))
                    .padding(12.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Text(
                    text = "SEARCH ENGINE PREFERENCE",
                    color = terminalCyan,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 1.sp
                )

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    val strategies = listOf(
                        Triple(SearchStrategy.SCRAPER, "SCRAPER", Icons.Filled.Code),
                        Triple(SearchStrategy.PIPED, "PIPED NODE", Icons.Filled.Cloud),
                        Triple(SearchStrategy.OFFICIAL, "OFFICIAL API", Icons.Filled.Settings)
                    )

                    strategies.forEach { (strat, label, icon) ->
                        val isSelected = state.searchStrategy == strat
                        Box(
                            modifier = Modifier
                                .weight(1f)
                                .height(38.dp)
                                .background(
                                    if (isSelected) MaterialTheme.colorScheme.primary else Color.Black.copy(alpha = 0.2f),
                                    shape = RoundedCornerShape(6.dp)
                                )
                                .border(
                                    width = 1.dp,
                                    color = if (isSelected) MaterialTheme.colorScheme.primary else Color.DarkGray,
                                    shape = RoundedCornerShape(6.dp)
                                )
                                .clickable { viewModel.updateSearchStrategy(strat) },
                            contentAlignment = Alignment.Center
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(4.dp)
                            ) {
                                Icon(
                                    imageVector = icon,
                                    contentDescription = label,
                                    tint = if (isSelected) Color.White else Color.Gray,
                                    modifier = Modifier.size(14.dp)
                                )
                                Text(
                                    text = label,
                                    color = if (isSelected) Color.White else Color.Gray,
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                        }
                    }
                }

                // If Official API selected, show API Key input
                if (state.searchStrategy == SearchStrategy.OFFICIAL) {
                    OutlinedTextField(
                        value = state.userApiKey,
                        onValueChange = { viewModel.updateApiKey(it) },
                        label = { Text("Enter YouTube Data API v3 Key", color = Color.Gray, fontSize = 11.sp) },
                        modifier = Modifier.fillMaxWidth(),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = MaterialTheme.colorScheme.primary,
                            unfocusedBorderColor = Color.DarkGray,
                            focusedContainerColor = Color.Black.copy(alpha = 0.2f),
                            unfocusedContainerColor = Color.Black.copy(alpha = 0.2f)
                        ),
                        textStyle = androidx.compose.ui.text.TextStyle(color = Color.White, fontSize = 12.sp),
                        singleLine = true
                    )
                }

                // Node dropdown and fail switch
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    // Dropdown to configure primary Piped API instance
                    var isExpanded by remember { mutableStateOf(false) }
                    val apiInstances = remember {
                        listOf(
                            "kavin.rocks",
                            "nosebs.ru",
                            "leptons.xyz",
                            "piped.yt",
                            "privacy.com.de",
                            "colby.moe",
                            "adminforge.de",
                            "swg.dev",
                            "lre.yt",
                            "hostux.net",
                            "mha.fi",
                            "projectsegfau.lt",
                            "vepor.me",
                            "sugishare.moe",
                            "garudalinux.org"
                        )
                    }

                    Box(modifier = Modifier.weight(1.1f)) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(4.dp)
                        ) {
                            Box(modifier = Modifier.weight(1f)) {
                                ExposedDropdownMenuBox(
                                    expanded = isExpanded,
                                    onExpandedChange = { isExpanded = !isExpanded }
                                ) {
                                    OutlinedTextField(
                                        value = "Stream Node: ${apiInstances.getOrElse(state.preferredInstanceIndex) { "kavin.rocks" }}",
                                        onValueChange = {},
                                        readOnly = true,
                                        trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = isExpanded) },
                                        modifier = Modifier
                                            .menuAnchor()
                                            .fillMaxWidth(),
                                        colors = OutlinedTextFieldDefaults.colors(
                                            focusedBorderColor = Color.Transparent,
                                            unfocusedBorderColor = Color.Transparent,
                                            focusedContainerColor = Color.Black.copy(alpha = 0.2f),
                                            unfocusedContainerColor = Color.Black.copy(alpha = 0.2f)
                                        ),
                                        textStyle = androidx.compose.ui.text.TextStyle(fontSize = 11.sp, color = Color.White)
                                    )

                                    ExposedDropdownMenu(
                                        expanded = isExpanded,
                                        onDismissRequest = { isExpanded = false }
                                    ) {
                                        apiInstances.forEachIndexed { index, name ->
                                            DropdownMenuItem(
                                                text = { Text(name, fontSize = 11.sp) },
                                                onClick = {
                                                    viewModel.updatePreferredInstance(index)
                                                    isExpanded = false
                                                }
                                            )
                                        }
                                    }
                                }
                            }
                            IconButton(
                                onClick = { viewModel.autoDetectFastestInstance() },
                                modifier = Modifier.size(36.dp)
                            ) {
                                Icon(
                                    imageVector = Icons.Filled.Bolt,
                                    contentDescription = "Auto-detect Node",
                                    tint = terminalGreen,
                                    modifier = Modifier.size(22.dp)
                                )
                            }
                        }
                    }

                    // Demonstration Failure Toggle
                    Row(
                        modifier = Modifier.weight(0.9f),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.End
                    ) {
                        Icon(
                            imageVector = Icons.Filled.BugReport,
                            contentDescription = "Manual Fail",
                            tint = if (state.forceManualFail) terminalAmber else Color.Gray,
                            modifier = Modifier.size(16.dp)
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = "Force Manual Fail",
                                color = Color.White,
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Bold
                            )
                            Text(
                                text = "Test Fallbacks",
                                color = Color.Gray,
                                fontSize = 8.sp
                            )
                        }
                        Switch(
                            checked = state.forceManualFail,
                            onCheckedChange = { viewModel.toggleForceManualFail() },
                            modifier = Modifier.scale(0.8f),
                            colors = SwitchDefaults.colors(
                                checkedThumbColor = terminalAmber,
                                checkedTrackColor = terminalAmber.copy(alpha = 0.4f),
                                uncheckedThumbColor = Color.Gray,
                                uncheckedTrackColor = Color.DarkGray
                            )
                        )
                    }
                }
            }

            // Split View layout: ExoPlayer / Terminal at the top, Search Results / Grid at bottom
            Column(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth(),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                // Video Playback Panel & Live Stats
                if (state.selectedVideo != null) {
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        colors = CardDefaults.cardColors(containerColor = cardColor),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Column {
                            // Player Area
                            if (state.activeStreamUrl != null) {
                                VideoPlayer(
                                    videoUrl = state.activeStreamUrl!!,
                                    onPlaybackError = { err ->
                                        viewModel.addLog("❌ ExoPlayer Playback Error: $err")
                                    },
                                    onPlaybackStateChanged = { s ->
                                        viewModel.addLog("🎞️ ExoPlayer State: $s")
                                    },
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .aspectRatio(16f / 9f)
                                        .clip(RoundedCornerShape(topStart = 12.dp, topEnd = 12.dp))
                                )
                            } else if (state.useWebViewFallback) {
                                YoutubeWebViewPlayer(
                                    videoId = state.selectedVideo!!.id,
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .aspectRatio(16f / 9f)
                                        .clip(RoundedCornerShape(topStart = 12.dp, topEnd = 12.dp))
                                )
                            } else {
                                Box(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .aspectRatio(16f / 9f)
                                        .background(Color.Black),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Column(horizontalAlignment = Alignment.CenterAlignment) {
                                        CircularProgressIndicator(color = MaterialTheme.colorScheme.primary)
                                        Spacer(modifier = Modifier.height(8.dp))
                                        Text("Extracting Stream...", color = Color.Gray)
                                    }
                                }
                            }

                            // Active Stream Metadata Panel
                            Column(modifier = Modifier.padding(12.dp)) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text(
                                        text = state.selectedVideo!!.title,
                                        color = Color.White,
                                        fontSize = 14.sp,
                                        fontWeight = FontWeight.Bold,
                                        maxLines = 2,
                                        overflow = TextOverflow.Ellipsis,
                                        modifier = Modifier.weight(1f)
                                    )
                                    Spacer(modifier = Modifier.width(8.dp))
                                    
                                    // Engine Badge
                                    state.activeStreamSource?.let { source ->
                                        val badgeColor = when {
                                            source.contains("Embed", ignoreCase = true) -> terminalCyan
                                            source.contains("Fallback", ignoreCase = true) -> terminalCyan
                                            else -> terminalGreen
                                        }
                                        val badgeText = when {
                                            source.contains("Embed", ignoreCase = true) -> "OFFICIAL EMBED"
                                            source.contains("Fallback", ignoreCase = true) -> "PIPED FALLBACK"
                                            else -> "DIRECT MANUAL"
                                        }
                                        Box(
                                            modifier = Modifier
                                                .border(1.dp, badgeColor, RoundedCornerShape(4.dp))
                                                .background(badgeColor.copy(alpha = 0.15f))
                                                .padding(horizontal = 8.dp, vertical = 4.dp)
                                        ) {
                                            Text(
                                                text = badgeText,
                                                color = badgeColor,
                                                fontSize = 10.sp,
                                                fontWeight = FontWeight.Bold
                                            )
                                        }
                                    }
                                }

                                Spacer(modifier = Modifier.height(4.dp))

                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween
                                ) {
                                    Text(
                                        text = "Channel: ${state.selectedVideo!!.uploader}",
                                        color = Color.LightGray,
                                        fontSize = 11.sp
                                    )
                                    if (state.activeStreamSource != null) {
                                        Text(
                                            text = "Stream: ${state.activeStreamSource}",
                                            color = Color.Gray,
                                            fontSize = 10.sp
                                        )
                                    }
                                }
                            }
                        }
                    }
                }

                // Live Terminal System Logs Console
                Column(
                    modifier = Modifier
                        .weight(0.4f)
                        .fillMaxWidth()
                        .background(terminalColor, shape = RoundedCornerShape(8.dp))
                        .border(1.dp, Color.DarkGray, RoundedCornerShape(8.dp))
                        .padding(10.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                imageVector = Icons.Filled.Terminal,
                                contentDescription = "Terminal Logs",
                                tint = terminalGreen,
                                modifier = Modifier.size(16.dp)
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = "SYSTEM RECOVERY TERMINAL CONSOLE",
                                color = terminalGreen,
                                fontSize = 10.sp,
                                fontFamily = FontFamily.Monospace,
                                fontWeight = FontWeight.Bold
                            )
                        }
                        IconButton(
                            onClick = { viewModel.clearLogs() },
                            modifier = Modifier.size(24.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Filled.Delete,
                                contentDescription = "Clear Logs",
                                tint = Color.Gray,
                                modifier = Modifier.size(16.dp)
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(6.dp))

                    val listState = rememberLazyListState()
                    LaunchedEffect(state.logs.size) {
                        if (state.logs.isNotEmpty()) {
                            listState.animateScrollToItem(state.logs.size - 1)
                        }
                    }

                    LazyColumn(
                        state = listState,
                        modifier = Modifier.fillMaxSize()
                    ) {
                        items(state.logs) { logMsg ->
                            val color = when {
                                logMsg.contains("❌") || logMsg.contains("🚨") -> Color.Red
                                logMsg.contains("⚠️") || logMsg.contains("WARNING") -> terminalAmber
                                logMsg.contains("✅") || logMsg.contains("Success") || logMsg.contains("⚡") -> terminalGreen
                                logMsg.contains("🔍") || logMsg.contains("📡") || logMsg.contains("⚙️") -> terminalCyan
                                else -> Color.LightGray
                            }
                            Text(
                                text = logMsg,
                                color = color,
                                fontSize = 10.sp,
                                fontFamily = FontFamily.Monospace,
                                modifier = Modifier.padding(vertical = 2.dp)
                            )
                        }
                    }
                }

                // Video Results Header & List (occupies the rest)
                Column(
                    modifier = Modifier.weight(0.6f)
                ) {
                    Text(
                        text = "SEARCH RESULTS / SUGGESTIONS",
                        color = Color.LightGray,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(bottom = 8.dp)
                    )

                    if (state.isLoading && state.searchResults.isEmpty()) {
                        Box(
                            modifier = Modifier.fillMaxSize(),
                            contentAlignment = Alignment.Center
                        ) {
                            CircularProgressIndicator(color = MaterialTheme.colorScheme.primary)
                        }
                    } else if (state.searchResults.isEmpty()) {
                        Box(
                            modifier = Modifier
                                .fillMaxSize()
                                .background(cardColor, shape = RoundedCornerShape(8.dp)),
                            contentAlignment = Alignment.Center
                        ) {
                            Column(horizontalAlignment = Alignment.CenterAlignment) {
                                Icon(
                                    imageVector = Icons.Filled.Cloud,
                                    contentDescription = "Empty Search",
                                    tint = Color.DarkGray,
                                    modifier = Modifier.size(48.dp)
                                )
                                Spacer(modifier = Modifier.height(8.dp))
                                Text(
                                    text = "No videos loaded.",
                                    color = Color.Gray,
                                    fontSize = 13.sp
                                )
                                Text(
                                    text = "Type a term above or use quick-play.",
                                    color = Color.DarkGray,
                                    fontSize = 11.sp
                                )
                            }
                        }
                    } else {
                        val searchScrollState = rememberLazyListState()
                        val shouldLoadMore = remember {
                            derivedStateOf {
                                val totalItemsCount = searchScrollState.layoutInfo.totalItemsCount
                                val lastVisibleItemIndex = searchScrollState.layoutInfo.visibleItemsInfo.lastOrNull()?.index ?: 0
                                lastVisibleItemIndex >= totalItemsCount - 4 && totalItemsCount > 0
                            }
                        }
                        LaunchedEffect(shouldLoadMore.value) {
                            if (shouldLoadMore.value) {
                                viewModel.loadMoreVideos()
                            }
                        }

                        LazyColumn(
                            state = searchScrollState,
                            modifier = Modifier.fillMaxSize(),
                            verticalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            items(state.searchResults) { item ->
                                VideoCard(
                                    video = item,
                                    isSelected = state.selectedVideo?.id == item.id,
                                    onClick = { viewModel.selectAndPlayVideo(item) },
                                    cardColor = cardColor
                                )
                            }

                            if (state.isLoadingMore) {
                                item {
                                    Box(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .padding(16.dp),
                                        contentAlignment = Alignment.Center
                                    ) {
                                        CircularProgressIndicator(
                                            color = MaterialTheme.colorScheme.primary,
                                            modifier = Modifier.size(24.dp)
                                        )
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun VideoCard(
    video: PipedSearchResult,
    isSelected: Boolean,
    onClick: () -> Unit,
    cardColor: Color
) {
    val borderColor = if (isSelected) MaterialTheme.colorScheme.primary else Color.Transparent

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() }
            .border(2.dp, borderColor, RoundedCornerShape(8.dp)),
        colors = CardDefaults.cardColors(containerColor = cardColor),
        shape = RoundedCornerShape(8.dp)
    ) {
        Row(
            modifier = Modifier.padding(8.dp),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            // Video Thumbnail
            Box(
                modifier = Modifier
                    .width(130.dp)
                    .aspectRatio(16f / 9f)
                    .clip(RoundedCornerShape(6.dp))
            ) {
                AsyncImage(
                    model = video.thumbnail,
                    contentDescription = "Thumbnail for ${video.title}",
                    modifier = Modifier.fillMaxSize(),
                    contentScale = ContentScale.Crop
                )

                // Duration Overlay
                if (video.duration > 0) {
                    val durationStr = formatDuration(video.duration)
                    Box(
                        modifier = Modifier
                            .align(Alignment.BottomEnd)
                            .padding(4.dp)
                            .background(Color.Black.copy(alpha = 0.75f), RoundedCornerShape(2.dp))
                            .padding(horizontal = 4.dp, vertical = 2.dp)
                    ) {
                        Text(
                            text = durationStr,
                            color = Color.White,
                            fontSize = 9.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
            }

            // Info Column
            Column(
                modifier = Modifier.weight(1f),
                verticalArrangement = Arrangement.SpaceBetween
            ) {
                Text(
                    text = video.title,
                    color = Color.White,
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Bold,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = video.uploader,
                    color = MaterialTheme.colorScheme.primary,
                    fontSize = 11.sp,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
                Spacer(modifier = Modifier.height(2.dp))
                Row(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = if (video.views > 0) formatViews(video.views) else "",
                        color = Color.Gray,
                        fontSize = 10.sp
                    )
                    Text(
                        text = video.uploadedString,
                        color = Color.Gray,
                        fontSize = 10.sp
                    )
                }
            }
        }
    }
}

private fun formatDuration(seconds: Int): String {
    val m = seconds / 60
    val s = seconds % 60
    return if (m >= 60) {
        val h = m / 60
        val mm = m % 60
        String.format("%d:%02d:%02d", h, mm, s)
    } else {
        String.format("%d:%02d", m, s)
    }
}

private fun formatViews(views: Long): String {
    return when {
        views >= 1_000_000_000 -> String.format("%.1fB views", views / 1_000_000_000.0)
        views >= 1_000_000 -> String.format("%.1fM views", views / 1_000_000.0)
        views >= 1_000 -> String.format("%.1fK views", views / 1_000.0)
        else -> "$views views"
    }
}

// Custom Alignments and TextStyles helper to bypass import resolution bugs
private val Alignment.Companion.CenterAlignment: Alignment.Horizontal get() = Alignment.CenterHorizontally
// TextStyle helper removed
