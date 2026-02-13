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
    var userName by mutableStateOf("") // Para guardar o nome do user
    
    var mensagemStatus by mutableStateOf<String?>(null) // Para apresentar erros
    var loginSuccess by mutableStateOf(false) // muda ecrã

    // Lógica Login
    fun fazerLogin() {
        val request = LoginRequest(email, password)
        val context = getApplication<Application>().applicationContext

        RetrofitClient.getInstance(context).login(request).enqueue(object : Callback<LoginResponse> {
            
            // Resposta do server
            override fun onResponse(call: Call<LoginResponse>, response: Response<LoginResponse>) {
                if (response.isSuccessful) {
                    val loginResponse = response.body()
                    if (loginResponse != null) {
                        // VERIFICAÇÃO DE ROLE
                        if (loginResponse.user.role != "formador") {
                            mensagemStatus = "Acesso restrito a formadores."
                            return
                        }

                        //guardar o Token no SharedPreferences
                        TokenManager.saveToken(context, loginResponse.token)

                        userName = loginResponse.user.nome
                        
                        //Atualizar estado UI navegar
                        loginSuccess = true
                    }
                } else {
                    mensagemStatus = "Erro: Dados Inválidos (${response.code()})"
                }
            }
            
            // Falha na ligação
            override fun onFailure(call: Call<LoginResponse>, t: Throwable) {
                mensagemStatus = "Erro Rede: ${t.message}"
            }
        })
    }
}
