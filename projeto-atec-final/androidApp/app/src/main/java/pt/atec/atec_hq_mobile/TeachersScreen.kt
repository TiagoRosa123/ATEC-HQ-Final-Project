package pt.atec.atec_hq_mobile

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Person
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavController
import pt.atec.atec_hq_mobile.ui.theme.*

@Composable
fun TeachersScreen(navController: NavController, viewModel: TeachersViewModel = viewModel()) {
    LaunchedEffect(Unit) { viewModel.fetchTeachers() }
    
    Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        Spacer(modifier = Modifier.height(35.dp))
        // Título ou Espaço
        Text(
            text = "Formadores",
            style = MaterialTheme.typography.headlineMedium,
            color = AtecText,
            modifier = Modifier.padding(bottom = 16.dp)
        )

        // Conteúdo (ocupa o espaço todo disponível)
        if (viewModel.isLoading) {
            Box(modifier = Modifier.weight(1f).fillMaxWidth(), contentAlignment = Alignment.Center) {
                CircularProgressIndicator(color = AtecBlue)
            }
        } else {
            LazyColumn(
                modifier = Modifier.weight(1f),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(viewModel.teachersList) { teacher ->
                    TeacherCard(teacher)
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))
    }
}

@Composable
fun TeacherCard(teacher: Teachers) {
    Card(
        colors = CardDefaults.cardColors(containerColor = AtecCard),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
        modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp)
    ) {
        Row(
            modifier = Modifier.padding(16.dp).fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Surface(
                shape = CircleShape,
                color = AtecBlue.copy(alpha = 0.1f),
                modifier = Modifier.size(50.dp)
            ) {
                Box(contentAlignment = Alignment.Center) {
                    Icon(imageVector = Icons.Default.Person, contentDescription = null, tint = AtecBlue, modifier = Modifier.size(24.dp))
                }
            }
            Spacer(modifier = Modifier.width(16.dp))
            Column {
                Text(text = teacher.nome, style = MaterialTheme.typography.titleMedium, color = AtecText, fontWeight = FontWeight.Bold)
                Text(text = teacher.email, style = MaterialTheme.typography.bodyMedium, color = Color.Gray)
            }
        }
    }
}
