package com.cafeteria.app

import retrofit2.Response
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.Header
import retrofit2.http.PATCH
import retrofit2.http.Path

// Data classes
data class LoginRequest(val email: String, val password: String)

data class LoginResponse(
    val token: String,
    val user: User
)

data class User(
    val id: String,
    val name: String,
    val email: String,
    val role: String
)

data class Order(
    val id: String,
    val status: String,
    val totalPrice: Double,
    val createdAt: String,
    val user: User,
    val items: List<OrderItem>
)

data class OrderItem(
    val id: String,
    val quantity: Int,
    val menuItem: MenuItem
)

data class MenuItem(
    val id: String,
    val name: String,
    val price: Double
)

data class StatusUpdate(val status: String)

// API Interface
interface ApiService {

    @retrofit2.http.POST("auth/login")
    suspend fun login(@Body request: LoginRequest): Response<LoginResponse>

    @GET("orders")
    suspend fun getOrders(
        @Header("Authorization") token: String
    ): Response<List<Order>>

    @PATCH("orders/{id}/status")
    suspend fun updateStatus(
        @Header("Authorization") token: String,
        @Path("id") orderId: String,
        @Body status: StatusUpdate
    ): Response<Order>
}

// Retrofit instance
object RetrofitClient {
    // Use your computer's IP address so Android emulator can reach it
    private const val BASE_URL = "http://localhost:3001/"

    val api: ApiService by lazy {
        Retrofit.Builder()
            .baseUrl(BASE_URL)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(ApiService::class.java)
    }
}