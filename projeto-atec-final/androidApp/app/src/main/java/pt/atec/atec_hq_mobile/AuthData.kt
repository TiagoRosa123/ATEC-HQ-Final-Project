package pt.atec.atec_hq_mobile

import retrofit2.Call
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.Body
import retrofit2.http.POST
import retrofit2.http.GET
import android.content.Context
import okhttp3.OkHttpClient

data class LoginRequest(val email: String, val password: String)
data class LoginResponse(val token: String, val user: UserData)
data class UserData(val id: Int, val nome: String)
data class Courses(val id: Int, val nome: String, val area: String, val duracao_horas: Int)
data class Students(val id: Int, val nome: String, val email: String)
data class Teachers(val id: Int, val nome: String, val email: String)
data class Rooms(val id: Int, val nome: String, val capacidade: Int, val recursos: String)

// endpoints
interface ApiService {
    @POST("/auth/login")
    fun login(@Body request: LoginRequest): Call<LoginResponse>
    @GET("/api/public/courses")
    fun getCourses(): Call<List<Courses>>
    @GET("/dashboard/students")
    fun getStudents(): Call<List<Students>>
    @GET("/dashboard/teachers")
    fun getTeachers(): Call<List<Teachers>>
    @GET("/rooms/available")
    fun getRooms(): Call<List<Rooms>>
}

//Comun. API
object RetrofitClient {
    private const val BASE_URL = "http://10.0.2.2:5000/"

    // em memoria volatile para garantir queprocessos veem a versão mais atual
    @Volatile
    private var instance: ApiService? = null

    fun getInstance(context: Context): ApiService {
        // synchronized - impossivel criar instância ao mesmo tempo
        return instance ?: synchronized(this) {
            
            // Configurar HTTP
            // Add AuthInterceptor para colar o Token em cada pedido
            val motor = OkHttpClient.Builder()
                .addInterceptor(AuthInterceptor(context))
                .build()

            //Construir o Retrofit
            val retrofit = Retrofit.Builder()
                .baseUrl(BASE_URL)
                .client(motor)
                .addConverterFactory(GsonConverterFactory.create()) //converte JSON p/ Kotlin
                .build()

            //cria a instância API
            instance = retrofit.create(ApiService::class.java)
            instance!!
        }
    }
}