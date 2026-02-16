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
data class UserData(val id: Int, val nome: String, val role: String)
data class Courses(val id: Int, val nome: String, val area: String, val duracao_horas: Int)
data class Students(val id: Int, val nome: String, val email: String)
data class Teachers(val id: Int, val nome: String, val email: String)
data class Rooms(val id: Int, val nome: String, val capacidade: Int, val recursos: String)

data class ReservationRequest(val sala_id: Int, val data_inicio: String, val data_fim: String, val motivo: String)
data class ClassWithStudents(val turma: String, val students: List<Students>)

// endpoints
interface ApiService {
    @POST("/auth/login")
    fun login(@Body request: LoginRequest): Call<LoginResponse>

    @GET("/courses/running") 
    fun getRunningCourses(): Call<List<Courses>>

    @GET("/dashboard/students-by-class")
    fun getStudentsByClass(): Call<List<ClassWithStudents>>

    @GET("/dashboard/teachers")
    fun getTeachers(): Call<List<Teachers>>
    @GET("/rooms/available")
    fun getRooms(): Call<List<Rooms>>
    
    @POST("/rooms/reserve")
    fun reserveRoom(@Body request: ReservationRequest): Call<Rooms>
}

// Comunicacao com API.
object RetrofitClient {
    private const val BASE_URL = "http://10.0.2.2:5000/" // 10.0.2.2 é o alias do emulador para o localhost da máquina host

    // em memoria volatile para garantir que processos veem a versão mais atual
    @Volatile
    private var instance: ApiService? = null

    fun getInstance(context: Context): ApiService {
        return instance ?: synchronized(this) {
            instance ?: run {
                
                // cliente HTTP com Interceptor de Auth.
                val motor = OkHttpClient.Builder()
                    .addInterceptor(AuthInterceptor(context))
                    .build()

                val retrofit = Retrofit.Builder()
                    .baseUrl(BASE_URL)
                    .client(motor)
                    .addConverterFactory(GsonConverterFactory.create()) //converte JSON p/ Kotlin
                    .build()

                retrofit.create(ApiService::class.java).also { instance = it }
            }
        }
    }
}