package pt.atec.atec_hq_mobile

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.getValue
import androidx.compose.runtime.setValue
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class TeachersViewModel(application: Application) : AndroidViewModel(application) {
    var teachersList by mutableStateOf(emptyList<Teachers>()) // Lista de Formadores
    var isLoading by mutableStateOf(false)
    var messageStatus by mutableStateOf("")
    fun fetchTeachers() {
        isLoading = true
        val context = getApplication<Application>().applicationContext // Obte Contexto

        //Chamar o serviço
        RetrofitClient.getInstance(context).getTeachers().enqueue(object : Callback<List<Teachers>> {
            override fun onResponse(call: Call<List<Teachers>>, response: Response<List<Teachers>>) {
                isLoading = false
                if (response.isSuccessful) {
                    teachersList = response.body() ?: emptyList()
                    messageStatus = "Formadores carregados!"
                } else {
                    messageStatus = "Erro: ${response.code()}"
                }
            }

            override fun onFailure(call: Call<List<Teachers>>, t: Throwable) {
                isLoading = false
                messageStatus = "Erro Rede: ${t.message}"
            }
        })
    }
}