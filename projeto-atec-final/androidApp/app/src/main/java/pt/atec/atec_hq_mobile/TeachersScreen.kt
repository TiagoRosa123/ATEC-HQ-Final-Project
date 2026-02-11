package pt.atec.atec_hq_mobile

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavController

@Composable
fun TeachersScreen(navController: NavController, viewModel: TeachersViewModel = viewModel()) {
    LaunchedEffect(Unit) { viewModel.fetchTeachers() }

    Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        Spacer(modifier = Modifier.height(16.dp))
        Button(onClick = { navController.popBackStack() }) { Text("< Voltar") }
        Spacer(modifier = Modifier.height(16.dp))

        if (viewModel.isLoading) {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                CircularProgressIndicator()
            }
        } else {
            LazyColumn(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                items(viewModel.teachersList) { teacher ->
                    TeacherCard(teacher)
                }
            }
        }
    }
}

@Composable
fun TeacherCard(teacher: Teachers) {
    Card(elevation = CardDefaults.cardElevation(defaultElevation = 4.dp), modifier = Modifier.fillMaxWidth()) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(text = "Nome: ${teacher.nome}", style = MaterialTheme.typography.titleMedium)
            Text(text = "Email: ${teacher.email}", style = MaterialTheme.typography.bodyMedium)
        }
    }
}
