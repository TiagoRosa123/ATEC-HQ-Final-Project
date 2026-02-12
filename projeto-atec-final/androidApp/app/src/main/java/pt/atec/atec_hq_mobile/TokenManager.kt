package pt.atec.atec_hq_mobile

import android.content.Context
import android.content.SharedPreferences

object TokenManager {
    private const val PREF_NAME = "atec_prefs"
    private const val KEY_TOKEN = "jwt_token"

    private fun getPrefs(context: Context): SharedPreferences {
        // SharedPreferences para guardar Token
        return context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE)
    }

    // Guardar Token no login
    fun saveToken(context: Context, token: String) {
        val editor = getPrefs(context).edit()
        editor.putString(KEY_TOKEN, token)
        editor.apply() // Guarda
    }

    // Le Token do AuthInterceptor
    fun getToken(context: Context): String? {
        return getPrefs(context).getString(KEY_TOKEN, null)
    }

    // Apagar Token
    fun clearToken(context: Context) {
        val editor = getPrefs(context).edit()
        editor.remove(KEY_TOKEN)
        editor.apply()
    }
}
