package pt.atec.atec_hq_mobile

import android.content.Context
import okhttp3.Interceptor
import okhttp3.Response

// Recebe do tokenManager
class AuthInterceptor(private val context: Context) : Interceptor {

    override fun intercept(chain: Interceptor.Chain): Response {

        //Agarra no pedido
        val pedidoOriginal = chain.request()
        val construtorDoPedido = pedidoOriginal.newBuilder()
        // Vai buscar o token
        val token = TokenManager.getToken(context)
        //Se tiver token, cola
        if (token != null) {
            construtorDoPedido.addHeader("token", token)
        }
        // Constrói o pedido final
        return chain.proceed(construtorDoPedido.build())
    }
}