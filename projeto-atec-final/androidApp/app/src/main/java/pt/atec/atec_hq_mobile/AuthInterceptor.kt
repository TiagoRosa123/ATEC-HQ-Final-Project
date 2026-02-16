package pt.atec.atec_hq_mobile

import android.content.Context
import okhttp3.Interceptor
import okhttp3.Response

// Injetar automaticamente o Token JWT em todos os pedidos HTTP
class AuthInterceptor(private val context: Context) : Interceptor {
     //Intercepta o pedido, adiciona header se o token existir e prossegue.
    override fun intercept(chain: Interceptor.Chain): Response {

        //Obter pedido original
        val pedidoOriginal = chain.request()
        val construtorDoPedido = pedidoOriginal.newBuilder()
        
        //recuperar token guardado
        val token = TokenManager.getToken(context)

        //se existe token, injetar no header "token"
        if (token != null) {
            construtorDoPedido.addHeader("token", token)
        }

        //envia pedido
        return chain.proceed(construtorDoPedido.build())
    }
}