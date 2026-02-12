package pt.atec.atec_hq_mobile

import android.content.Context
import okhttp3.Interceptor
import okhttp3.Response

//"cola" o Token
class AuthInterceptor(private val context: Context) : Interceptor {

    override fun intercept(chain: Interceptor.Chain): Response {

        // agarrar no pedido original
        val pedidoOriginal = chain.request()
        val construtorDoPedido = pedidoOriginal.newBuilder()
        
        // buscar o token
        val token = TokenManager.getToken(context)

        //caso haja token, add ao header
        if (token != null) {
            construtorDoPedido.addHeader("token", token)
        }

        return chain.proceed(construtorDoPedido.build())
    }
}