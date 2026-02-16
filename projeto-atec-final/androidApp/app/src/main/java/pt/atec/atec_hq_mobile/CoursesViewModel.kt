package pt.atec.atec_hq_mobile

import androidx.lifecycle.AndroidViewModel
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.getValue
import androidx.compose.runtime.setValue
import android.app.Application
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class CoursesViewModel(application: Application) : AndroidViewModel(application) {
    // guardar uma LISTA de Cursos
    var coursesList by mutableStateOf(emptyList<Courses>())
    var isLoading by mutableStateOf(false)
    //buscar os dados
    fun fetchCourses() {
        isLoading = true

        val context = getApplication<Application>().applicationContext

        RetrofitClient.getInstance(context).getRunningCourses().enqueue(object : Callback<List<Courses>> {
            override fun onResponse(call: Call<List<Courses>>, response: Response<List<Courses>>) {

                isLoading = false

                if(response.isSuccessful){
                    coursesList = response.body() ?: emptyList()
                }
                else{
                    println ("Erro: ${response.code()}")
                }
            }
                override fun onFailure(call: Call<List<Courses>>, t: Throwable) {
                    isLoading = false
                    println("Erro Rede: ${t.message}")
            }
        })
    }
}