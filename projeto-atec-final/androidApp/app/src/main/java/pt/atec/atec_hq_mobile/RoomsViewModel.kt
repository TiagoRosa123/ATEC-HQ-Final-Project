package pt.atec.atec_hq_mobile

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.AndroidViewModel
import android.app.Application
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response
class RoomsViewModel (application: Application) : AndroidViewModel(application){
    var roomsList by mutableStateOf(emptyList<Rooms>()) // guardar uma LISTA de Cursos
    var isLoading by mutableStateOf(false)

    //buscar os dados
    fun fetchRooms() {
        isLoading = true
        val context = getApplication<Application>().applicationContext

        RetrofitClient.getInstance(context).getRooms().enqueue(object : Callback<List<Rooms>> {
            override fun onResponse(call: Call<List<Rooms>>, response: Response<List<Rooms>>) {

                isLoading = false

                if(response.isSuccessful){
                    roomsList = response.body() ?: emptyList()
                }else{
                    println ("Erro: ${response.code()}")
                }
            }

            override fun onFailure(call: Call<List<Rooms>>, t: Throwable) {
                isLoading = false
                println("Erro Rede: ${t.message}")
            }
        })
    }
}