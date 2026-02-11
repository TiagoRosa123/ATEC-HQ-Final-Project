package pt.atec.atec_hq_mobile

import androidx.lifecycle.AndroidViewModel
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.getValue
import androidx.compose.runtime.setValue
import android.app.Application
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class LoginViewModel(application: Application) : AndroidViewModel(application) {

    var email by mutableStateOf("")
    var password by mutableStateOf("")
    var mensagemStatus by mutableStateOf<String?>(null) // P/ mensagens
    var loginSuccess by mutableStateOf(false)
    fun fazerLogin() {
        val request = LoginRequest(email, password)
        val context = getApplication<Application>().applicationContext

        RetrofitClient.getInstance(context).login(request).enqueue(object : Callback<LoginResponse> {
            override fun onResponse(call: Call<LoginResponse>, response: Response<LoginResponse>) {
                if (response.isSuccessful) {
                    val loginResponse = response.body() // <--- Guardamos a resposta completa
                    if (loginResponse != null) {
                        // Guardar o Token
                        TokenManager.saveToken(context, loginResponse.token)
                        
                        mensagemStatus = "Login bem sucedido!"
                        loginSuccess = true
                    }
                } else {
                    mensagemStatus = "Erro: Dados Inválidos (${response.code()})"
                }
            }
            override fun onFailure(call: Call<LoginResponse>, t: Throwable) {
                mensagemStatus = "Erro Rede: ${t.message}"
            }
        })
    }
}
