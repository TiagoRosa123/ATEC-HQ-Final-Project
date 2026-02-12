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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Email
import androidx.compose.material.icons.filled.Lock
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.sp
import androidx.compose.foundation.shape.RoundedCornerShape
import pt.atec.atec_hq_mobile.ui.theme.*

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            ATEC_HQ_MobileTheme {
                val navController = rememberNavController()
                val viewModel: LoginViewModel = viewModel()

                // Define ecrãs da app
                NavHost(navController = navController, startDestination = "login") {

                    //Login
                    composable("login") {

                        //loginSuccess = true
                        LaunchedEffect(viewModel.loginSuccess) {
                            if (viewModel.loginSuccess) {
                                // vai p/ dashboard
                                navController.navigate("dashboard") {
                                    // "popUpTo": Remove o Login da pilha (botão voltar fecha a app)
                                    popUpTo("login") { inclusive = true }
                                }
                                viewModel.loginSuccess = false //"reset"
                            }
                        }

                        LoginScreen(viewModel = viewModel)
                    }
                    
                    //Dashboard
                    composable("dashboard") {
                        DashboardScreen(navController = navController, userName = viewModel.userName)
                    }
                    
                    composable("courses") {
                        val coursesViewModel: CoursesViewModel = viewModel()
                        CoursesScreen(navController = navController, viewModel = coursesViewModel)
                    }
                    
                    composable("students") {
                        val studentsViewModel: StudentsViewModel = viewModel()
                        StudentsScreen(navController = navController, viewModel = studentsViewModel)
                    }
                    
                    composable("teachers") {
                        val teachersViewModel: TeachersViewModel = viewModel()
                        TeachersScreen(navController = navController, viewModel = teachersViewModel)
                    }
                    
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
    viewModel: LoginViewModel = viewModel()
) {
    val context = LocalContext.current

    // mensagens ViewModel
    if (viewModel.mensagemStatus != null) {
        Toast.makeText(context, viewModel.mensagemStatus, Toast.LENGTH_SHORT).show()
        viewModel.mensagemStatus = null // Limpa mensagem
    }

    Box(
        modifier = modifier
            .fillMaxSize()
            .padding(16.dp),
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            modifier = Modifier.fillMaxWidth()
        ) {
            // LOGO: ATEC (Cinza) HQ (Azul)
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(
                    text = "ATEC",
                    style = MaterialTheme.typography.headlineLarge,
                    fontWeight = FontWeight.Bold,
                    color = Color.Gray // AtecText ou Secondary
                )
                Text(
                    text = "HQ",
                    style = MaterialTheme.typography.headlineLarge,
                    fontWeight = FontWeight.Bold,
                    color = AtecBlue
                )
            }
            Text(
                text = "Plataforma de Gestão de Formação",
                style = MaterialTheme.typography.bodySmall,
                color = Color.Gray
            )

            Spacer(modifier = Modifier.height(32.dp))

            // CARD DO FORMULÁRIO
            Card(
                colors = CardDefaults.cardColors(containerColor = AtecCard),
                elevation = CardDefaults.cardElevation(defaultElevation = 8.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(
                    modifier = Modifier.padding(24.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = "Iniciar Sessão",
                        style = MaterialTheme.typography.titleLarge,
                        color = AtecDarkBlue,
                        fontWeight = FontWeight.Bold
                    )
                    
                    Spacer(modifier = Modifier.height(24.dp))

                    // EMAIL
                    OutlinedTextField(
                        value = viewModel.email,
                        onValueChange = { viewModel.email = it },
                        label = { Text("Email") },
                        leadingIcon = { Icon(imageVector = Icons.Default.Email, contentDescription = null, tint = Color.Gray) },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true,
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = AtecBlue,
                            unfocusedBorderColor = Color.LightGray
                        )
                    )

                    Spacer(modifier = Modifier.height(16.dp))

                    // PASSWORD
                    OutlinedTextField(
                        value = viewModel.password,
                        onValueChange = { viewModel.password = it },
                        label = { Text("Password") },
                        leadingIcon = { Icon(imageVector = Icons.Default.Lock, contentDescription = null, tint = Color.Gray) },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true,
                        visualTransformation = PasswordVisualTransformation(),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = AtecBlue,
                            unfocusedBorderColor = Color.LightGray
                        )
                    )

                    Spacer(modifier = Modifier.height(24.dp))

                    // BOTÃO ENTRAR
                    Button(
                        onClick = { viewModel.fazerLogin() },
                        modifier = Modifier.fillMaxWidth().height(50.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = AtecBlue),
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Text("Entrar", fontSize = 16.sp, fontWeight = FontWeight.Bold)
                    }
                }
            }

            Spacer(modifier = Modifier.height(32.dp))

            // FOOTER
            Text(
                text = "© 2026 ATEC.HQ Academia de Formação",
                style = MaterialTheme.typography.bodySmall,
                color = Color.Gray.copy(alpha = 0.6f)
            )
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
