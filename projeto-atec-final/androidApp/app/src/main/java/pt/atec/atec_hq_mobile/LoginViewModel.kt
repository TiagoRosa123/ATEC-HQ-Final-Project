package pt.atec.atec_hq_mobile

import androidx.lifecycle.AndroidViewModel
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.getValue
import androidx.compose.runtime.setValue
import android.app.Application
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

//ViewModel responsável pela lógica de autenticação
//usa AndroidViewModel para ter acesso ao Contexto (necessário para SharedPreferences)

class LoginViewModel(application: Application) : AndroidViewModel(application) {
    // Estado formulário
    var email by mutableStateOf("")
    var password by mutableStateOf("")
    
    var userName by mutableStateOf("") // Nome p/ bem-vindo
    var mensagemStatus by mutableStateOf<String?>(null) // Feedback de erro
    var loginSuccess by mutableStateOf(false) // Trigger de navegação

    //Executa login, valida o role e guarda o token
    fun fazerLogin() {
        val request = LoginRequest(email, password)
        val context = getApplication<Application>().applicationContext

        //chamada via Retrofit
        RetrofitClient.getInstance(context).login(request).enqueue(object : Callback<LoginResponse> {
            
            override fun onResponse(call: Call<LoginResponse>, response: Response<LoginResponse>) {
                if (response.isSuccessful) {
                    val loginResponse = response.body()
                    if (loginResponse != null) {
                        
                        // Validação de apenas Formadores
                        if (loginResponse.user.role != "formador") {
                            mensagemStatus = "Acesso restrito a formadores."
                            return
                        }

                        //Persisti Token para sessões futuras
                        TokenManager.saveToken(context, loginResponse.token)

                        userName = loginResponse.user.nome
                        
                        // "sucesso" para a view navegar
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
