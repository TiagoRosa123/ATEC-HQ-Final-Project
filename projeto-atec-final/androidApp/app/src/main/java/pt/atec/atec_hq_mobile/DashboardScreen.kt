package pt.atec.atec_hq_mobile

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController

@Composable
fun DashboardScreen(navController: NavController, userName: String, modifier: Modifier = Modifier) {

    Column(
        modifier = modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally
    ){
        Text(text="Bem vindo ${userName}")
        Spacer(modifier = Modifier.height(55.dp))

        Button(onClick = { navController.navigate("courses") },)
        { Text("Listar Cursos") }
        Spacer(modifier = Modifier.height(5.dp))

        Button(onClick = { navController.navigate("students") },) { Text("Listar Formandos") }
        Spacer(modifier = Modifier.height(5.dp))

        Button(onClick = { navController.navigate("teachers") },) { Text("Listar Formadores") }
        Spacer(modifier = Modifier.height(5.dp))

        Button(onClick = { navController.navigate("rooms")},) { Text("Listar Salas Disponiveis") }
        Spacer(modifier = Modifier.height(5.dp))

        Spacer(modifier = Modifier.height(30.dp))
        Button(onClick = { navController.navigate("login") },) { Text("Sair") }
    }


}