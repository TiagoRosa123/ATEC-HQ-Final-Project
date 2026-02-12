package pt.atec.atec_hq_mobile.ui.theme

import android.app.Activity
import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.dynamicDarkColorScheme
import androidx.compose.material3.dynamicLightColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext

private val DarkColorScheme = darkColorScheme(
    primary = AtecBlue,
    secondary = AtecOrange,
    tertiary = AtecDarkBlue
)

private val LightColorScheme = lightColorScheme(
    primary = AtecBlue,       // Botões e Títulos
    secondary = AtecOrange,   // Destaques
    tertiary = AtecDarkBlue,
    background = AtecBg,      // Fundo
    surface = AtecCard,       // Cartões
    onPrimary = Color.White,
    onSecondary = Color.White,
    onBackground = AtecText,
    onSurface = AtecText
)

@Composable
fun ATEC_HQ_MobileTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    // Desligamos Dynamic Color para forçar as cores da ATEC
    dynamicColor: Boolean = false, 
    content: @Composable () -> Unit
) {
    val colorScheme = when {
        dynamicColor && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S -> {
            val context = LocalContext.current
            if (darkTheme) dynamicDarkColorScheme(context) else dynamicLightColorScheme(context)
        }

        darkTheme -> DarkColorScheme
        else -> LightColorScheme
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}