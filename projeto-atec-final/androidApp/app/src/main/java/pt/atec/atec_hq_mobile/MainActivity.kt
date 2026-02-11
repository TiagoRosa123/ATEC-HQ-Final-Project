package pt.atec.atec_hq_mobile

import android.os.Bundle
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.Body
import retrofit2.http.POST
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import pt.atec.atec_hq_mobile.ui.theme.ATEC_HQ_MobileTheme


class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            ATEC_HQ_MobileTheme {
                val navController = rememberNavController()
                val viewModel: LoginViewModel = viewModel()

                NavHost(navController = navController, startDestination = "login") {

                    //Login
                    composable("login") {
                        LaunchedEffect(viewModel.loginSuccess) {
                            if (viewModel.loginSuccess) {
                                // 1. Navegar para o Dashboard
                                navController.navigate("dashboard") {
                                    // 2. Apagar o histórico (para o botão "Voltar" fechar a app e não voltar ao Login)
                                    popUpTo("login") { inclusive = true }
                                }
                                // 3. Reset da bandeira
                                viewModel.loginSuccess = false
                            }
                        }

                        LoginScreen(viewModel = viewModel)
                    }
                    //Dashboard
                    composable("dashboard") {
                        DashboardScreen(navController = navController, userName = viewModel.email)
                    }

                    //Courses
                    composable("courses") {
                        val coursesViewModel: CoursesViewModel = viewModel()
                        CoursesScreen(navController = navController, viewModel = coursesViewModel)
                    }

                    //Students
                    composable("students") {
                        val studentsViewModel: StudentsViewModel = viewModel()
                        StudentsScreen(navController = navController, viewModel = studentsViewModel)
                    }

                    //Teachers
                    composable("teachers") {
                        val teachersViewModel: TeachersViewModel = viewModel()
                        TeachersScreen(navController = navController, viewModel = teachersViewModel)
                    }

                    //Rooms
                    composable("rooms") {
                        val roomsViewModel: RoomsViewModel = viewModel()
                        RoomsScreen(navController = navController, viewModel = roomsViewModel)
                    }
                }
            }
        }
    }
}

@Composable
fun LoginScreen(
    modifier: Modifier = Modifier,
    viewModel: LoginViewModel = viewModel() //viewModel
) {
    val context = LocalContext.current

    // mensagens do ViewModel
    if (viewModel.mensagemStatus != null) {
        Toast.makeText(context, viewModel.mensagemStatus, Toast.LENGTH_SHORT).show()
        viewModel.mensagemStatus = null // Limpa mensagem
    }
    Column(
        modifier = modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(text = "Login ATEC HQ", style = MaterialTheme.typography.headlineMedium)
        Spacer(modifier = Modifier.height(32.dp))
        // Ler e Escrever no ViewModel
        OutlinedTextField(
            value = viewModel.email,
            onValueChange = { viewModel.email = it },
            label = { Text("Email") },
            modifier = Modifier.fillMaxWidth()
        )

        Spacer(modifier = Modifier.height(16.dp))
        OutlinedTextField(
            value = viewModel.password,
            onValueChange = { viewModel.password = it },
            label = { Text("Password") },
            modifier = Modifier.fillMaxWidth()
        )
        Spacer(modifier = Modifier.height(24.dp))
        Button(
            onClick = {
                viewModel.fazerLogin() //função do ViewModel
            },
            modifier = Modifier.fillMaxWidth()
        ) {
            Text("Entrar")
        }
    }
}

@Preview(showBackground = true)
@Composable
fun LoginPreview() {
    ATEC_HQ_MobileTheme {
        LoginScreen()
    }
}
