package com.cafeteria.app

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun OrdersScreen(
    token: String,
    onLogout: () -> Unit
) {
    var orders by remember { mutableStateOf<List<Order>>(emptyList()) }
    var isLoading by remember { mutableStateOf(true) }
    var updatingId by remember { mutableStateOf<String?>(null) }
    val scope = rememberCoroutineScope()

    val orangeColor = Color(0xFFEA580C)

    // Load orders when screen opens
    LaunchedEffect(Unit) {
        try {
            val response = RetrofitClient.api.getOrders("Bearer $token")
            if (response.isSuccessful) {
                orders = response.body() ?: emptyList()
            }
        } catch (e: Exception) {
            e.printStackTrace()
        } finally {
            isLoading = false
        }
    }

    fun refreshOrders() {
        scope.launch {
            try {
                val response = RetrofitClient.api.getOrders("Bearer $token")
                if (response.isSuccessful) {
                    orders = response.body() ?: emptyList()
                }
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }

    fun updateStatus(orderId: String, status: String) {
        scope.launch {
            updatingId = orderId
            try {
                val response = RetrofitClient.api.updateStatus(
                    "Bearer $token",
                    orderId,
                    StatusUpdate(status)
                )
                if (response.isSuccessful) {
                    refreshOrders()
                }
            } catch (e: Exception) {
                e.printStackTrace()
            } finally {
                updatingId = null
            }
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(
                            text = "👷 Staff Dashboard",
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = "Manage incoming orders",
                            fontSize = 12.sp,
                            color = Color.Gray
                        )
                    }
                },
                actions = {
                    TextButton(onClick = { refreshOrders() }) {
                        Text("Refresh", color = orangeColor)
                    }
                    TextButton(onClick = onLogout) {
                        Text("Logout", color = Color.Gray)
                    }
                }
            )
        }
    ) { padding ->

        if (isLoading) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding),
                contentAlignment = Alignment.Center
            ) {
                CircularProgressIndicator(color = orangeColor)
            }
        } else {

            val activeOrders = orders.filter { it.status != "DELIVERED" }
            val deliveredOrders = orders.filter { it.status == "DELIVERED" }

            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding)
                    .padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {

                // Active orders header
                item {
                    Text(
                        text = "Active Orders (${activeOrders.size})",
                        fontWeight = FontWeight.Bold,
                        fontSize = 16.sp,
                        color = Color.DarkGray
                    )
                }

                if (activeOrders.isEmpty()) {
                    item {
                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            colors = CardDefaults.cardColors(
                                containerColor = Color(0xFFF5F5F5)
                            )
                        ) {
                            Box(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(32.dp),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(
                                    text = "✅ All caught up!",
                                    color = Color.Gray
                                )
                            }
                        }
                    }
                }

                // Active order cards
                items(activeOrders) { order ->
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(12.dp),
                        elevation = CardDefaults.cardElevation(2.dp)
                    ) {
                        Column(modifier = Modifier.padding(16.dp)) {

                            // Order header
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.Top
                            ) {
                                Column {
                                    Text(
                                        text = order.user.name,
                                        fontWeight = FontWeight.SemiBold,
                                        fontSize = 15.sp
                                    )
                                    Text(
                                        text = order.user.email,
                                        fontSize = 12.sp,
                                        color = Color.Gray
                                    )
                                }

                                // Status badge
                                val badgeColor = if (order.status == "PLACED")
                                    Color(0xFFDCEFFB) else Color(0xFFDCFCE7)
                                val textColor = if (order.status == "PLACED")
                                    Color(0xFF1D4ED8) else Color(0xFF15803D)

                                Surface(
                                    color = badgeColor,
                                    shape = RoundedCornerShape(20.dp)
                                ) {
                                    Text(
                                        text = if (order.status == "PLACED")
                                            "🕐 Placed" else "✅ Ready",
                                        color = textColor,
                                        fontSize = 12.sp,
                                        fontWeight = FontWeight.Bold,
                                        modifier = Modifier.padding(
                                            horizontal = 10.dp,
                                            vertical = 4.dp
                                        )
                                    )
                                }
                            }

                            Spacer(modifier = Modifier.height(12.dp))
                            Divider()
                            Spacer(modifier = Modifier.height(8.dp))

                            // Order items
                            order.items.forEach { item ->
                                Text(
                                    text = "• ${item.menuItem.name} × ${item.quantity}",
                                    fontSize = 13.sp,
                                    color = Color.DarkGray
                                )
                            }

                            Spacer(modifier = Modifier.height(12.dp))

                            // Price and action button
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(
                                    text = "₹${order.totalPrice.toInt()}",
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 16.sp,
                                    color = orangeColor
                                )

                                if (order.status == "PLACED") {
                                    Button(
                                        onClick = {
                                            updateStatus(order.id, "READY")
                                        },
                                        colors = ButtonDefaults.buttonColors(
                                            containerColor = Color(0xFF16A34A)
                                        ),
                                        shape = RoundedCornerShape(8.dp),
                                        enabled = updatingId != order.id
                                    ) {
                                        Text(
                                            text = if (updatingId == order.id)
                                                "..." else "Mark Ready"
                                        )
                                    }
                                }

                                if (order.status == "READY") {
                                    Button(
                                        onClick = {
                                            updateStatus(order.id, "DELIVERED")
                                        },
                                        colors = ButtonDefaults.buttonColors(
                                            containerColor = Color(0xFF4B5563)
                                        ),
                                        shape = RoundedCornerShape(8.dp),
                                        enabled = updatingId != order.id
                                    ) {
                                        Text(
                                            text = if (updatingId == order.id)
                                                "..." else "Mark Delivered"
                                        )
                                    }
                                }
                            }
                        }
                    }
                }

                // Delivered orders section
                if (deliveredOrders.isNotEmpty()) {
                    item {
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = "Delivered (${deliveredOrders.size})",
                            fontWeight = FontWeight.Bold,
                            fontSize = 16.sp,
                            color = Color.Gray
                        )
                    }

                    items(deliveredOrders) { order ->
                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(12.dp),
                            colors = CardDefaults.cardColors(
                                containerColor = Color(0xFFF9FAFB)
                            )
                        ) {
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(12.dp),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Column {
                                    Text(
                                        text = order.user.name,
                                        fontSize = 13.sp,
                                        fontWeight = FontWeight.Medium,
                                        color = Color.Gray
                                    )
                                    Text(
                                        text = order.items.joinToString(", ") {
                                            it.menuItem.name
                                        },
                                        fontSize = 11.sp,
                                        color = Color.LightGray
                                    )
                                }
                                Text(
                                    text = "🎉 ₹${order.totalPrice.toInt()}",
                                    fontSize = 12.sp,
                                    color = Color.Gray
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}