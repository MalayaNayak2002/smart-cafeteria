package com.cafeteria.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.runtime.*
import androidx.compose.ui.graphics.Color
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.lightColorScheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MaterialTheme(
                colorScheme = lightColorScheme(
                    primary = Color(0xFFEA580C)
                )
            ) {
                CafeteriaApp()
            }
        }
    }
}

@Composable
fun CafeteriaApp() {
    var token by remember { mutableStateOf("") }
    var userRole by remember { mutableStateOf("") }

    if (token.isEmpty()) {
        LoginScreen(
            onLoginSuccess = { newToken, role ->
                token = newToken
                userRole = role
            }
        )
    } else {
        OrdersScreen(
            token = token,
            onLogout = {
                token = ""
                userRole = ""
            }
        )
    }
}