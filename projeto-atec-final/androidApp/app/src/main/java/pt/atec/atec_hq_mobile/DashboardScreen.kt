package pt.atec.atec_hq_mobile

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.unit.dp
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.graphics.Color
import androidx.navigation.NavController
import pt.atec.atec_hq_mobile.ui.theme.*

@Composable
fun DashboardScreen(navController: NavController, userName: String, modifier: Modifier = Modifier) {
    // Dados para os cartões (Titulo, Icone, Rota)
    val menuItems = listOf(
        MenuItem("Cursos", Icons.Default.List, "courses"),
        MenuItem("Formandos", Icons.Default.Person, "students"),
        MenuItem("Formadores", Icons.Default.Face, "teachers"),
        MenuItem("Salas", Icons.Default.Home, "rooms")
    )
    Column(
        modifier = modifier
            .fillMaxSize()
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        // Cabeçalho
        Spacer(modifier = Modifier.height(24.dp))
        Text(
            text = "Olá, $userName!",
            style = MaterialTheme.typography.headlineMedium,
            color = AtecText
        )
        Spacer(modifier = Modifier.height(5.dp))
        Text(
            text = buildAnnotatedString {
                append("Bem-vindo à ")
                withStyle(style = SpanStyle(color = Color(0xFF6c757d))) {
                    append("ATEC")
                }
                append("HQ")
            },
            style = MaterialTheme.typography.bodyLarge,
            color = MaterialTheme.colorScheme.primary
        )

        Spacer(modifier = Modifier.height(32.dp))

        //grelha
        LazyVerticalGrid(
            columns = GridCells.Fixed(2), //2 colunas
            horizontalArrangement = Arrangement.spacedBy(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp),
            modifier = Modifier.weight(1f) // Ocupa o espaço restante
        ) {
            items(menuItems) { item ->
                DashboardCard(item) { navController.navigate(item.route) }
            }
        }
        // Btn Sair
        Button(
            onClick = { navController.navigate("login") },
            colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.error),
            modifier = Modifier.fillMaxWidth().height(50.dp),
            shape = RoundedCornerShape(8.dp)
        ) {
            Text("Sair")
        }
    }
}

data class MenuItem(val title: String, val icon: ImageVector, val route: String) // Classe de dados simples para a lista

//Card
@Composable
fun DashboardCard(item: MenuItem, onClick: () -> Unit) {
    Card(
        colors = CardDefaults.cardColors(containerColor = AtecCard), // Cor de Fundo Branca
        elevation = CardDefaults.cardElevation(defaultElevation = 6.dp), // Sombra
        modifier = Modifier
            .fillMaxWidth()
            .height(130.dp) // Altura fixa
            .clickable { onClick() } // Clicavel
    ) {
        Column(
            modifier = Modifier.fillMaxSize(),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Icon(
                imageVector = item.icon,
                contentDescription = null,
                tint = AtecBlue, // Ícone Azul ATEC
                modifier = Modifier.size(40.dp)
            )
            Spacer(modifier = Modifier.height(12.dp))
            Text(
                text = item.title,
                style = MaterialTheme.typography.titleMedium,
                color = AtecText
            )
        }
    }
}