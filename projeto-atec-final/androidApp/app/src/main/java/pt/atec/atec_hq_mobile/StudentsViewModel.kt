package pt.atec.atec_hq_mobile

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.AndroidViewModel
import android.app.Application
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class StudentsViewModel (application: Application) : AndroidViewModel(application){
    // guardar uma LISTA de Cursos
    var studentsList by mutableStateOf(emptyList<Students>())
    var isLoading by mutableStateOf(false)

    //buscar os dados
    fun fetchStudents() {
        isLoading = true

        val context = getApplication<Application>().applicationContext

        RetrofitClient.getInstance(context).getStudents().enqueue(object : Callback<List<Students>> {
            override fun onResponse(call: Call<List<Students>>, response: Response<List<Students>>) {

                isLoading = false

                if(response.isSuccessful){
                    studentsList = response.body() ?: emptyList()
                }else{
                    println ("Erro: ${response.code()}")
                }
            }

            override fun onFailure(call: Call<List<Students>>, t: Throwable) {
                isLoading = false
                println("Erro Rede: ${t.message}")
            }
        })
    }
}