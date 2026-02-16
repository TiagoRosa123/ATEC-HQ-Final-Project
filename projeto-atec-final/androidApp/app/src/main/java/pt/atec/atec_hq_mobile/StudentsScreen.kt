package pt.atec.atec_hq_mobile

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Face
import androidx.compose.material3.*
import androidx.compose.foundation.clickable
import androidx.compose.material.icons.filled.ArrowForward
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.activity.compose.BackHandler
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavController
import pt.atec.atec_hq_mobile.ui.theme.*

@Composable
fun StudentsClassesScreen(navController: NavController, viewModel: StudentsViewModel) {
    LaunchedEffect(Unit) { viewModel.fetchStudents() }

    Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        Spacer(modifier = Modifier.height(35.dp))
        
        Text(
            text = "Turmas Ativas",
            style = MaterialTheme.typography.headlineMedium,
            color = AtecText,
            modifier = Modifier.padding(bottom = 16.dp)
        )

        if (viewModel.isLoading) {
            Box(modifier = Modifier.weight(1f).fillMaxWidth(), contentAlignment = Alignment.Center) {
                CircularProgressIndicator(color = AtecDarkBlue)
            }
        } else {
            LazyColumn(
                modifier = Modifier.weight(1f),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(viewModel.studentsList) { classGroup ->
                    ClassCard(classGroup) {
                        // Navigate using standard NavController
                        navController.navigate("class_details/${classGroup.turma}")
                    }
                }
            }
        }
        Spacer(modifier = Modifier.height(16.dp))
    }
}

@Composable
fun ClassDetailsScreen(navController: NavController, viewModel: StudentsViewModel, className: String?) {
    val selectedClass = viewModel.studentsList.find { it.turma == className }

    Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        Spacer(modifier = Modifier.height(35.dp))
        Text(
            text = "Turma: ${className ?: "N/A"}",
            style = MaterialTheme.typography.headlineMedium,
            color = AtecText,
            modifier = Modifier.padding(bottom = 16.dp)
        )

        if (selectedClass != null) {
            LazyColumn(
                modifier = Modifier.weight(1f),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(selectedClass.students) { student ->
                    StudentCard(student)
                }
            }
        } else {
             Box(modifier = Modifier.weight(1f).fillMaxWidth(), contentAlignment = Alignment.Center) {
                Text("Turma não encontrada.", color = Color.Gray)
            }
        }
        Spacer(modifier = Modifier.height(16.dp))
    }
}

@Composable
fun ClassCard(classGroup: ClassWithStudents, onClick: () -> Unit) {
    Card(
        colors = CardDefaults.cardColors(containerColor = AtecCard),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp),
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() }
    ) {
        Row(
             modifier = Modifier.padding(24.dp).fillMaxWidth(),
             verticalAlignment = Alignment.CenterVertically,
             horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Column {
                Text(
                    text = classGroup.turma,
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold,
                    color = AtecText
                )
                Text(
                    text = "${classGroup.students.size} Formandos",
                    style = MaterialTheme.typography.bodyMedium,
                    color = Color.Gray
                )
            }
            Icon(
                imageVector = Icons.Default.ArrowForward,
                contentDescription = "Ver Detalhes",
                tint = AtecDarkBlue
            )
        }
    }
}

@Composable
fun StudentCard(student: Students) {
    Card(
        colors = CardDefaults.cardColors(containerColor = AtecCard),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp),
        modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp)
    ) {
        Row(
            modifier = Modifier.padding(16.dp).fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Surface(
                shape = CircleShape,
                color = AtecDarkBlue.copy(alpha = 0.1f),
                modifier = Modifier.size(50.dp)
            ) {
                Box(contentAlignment = Alignment.Center) {
                    Icon(imageVector = Icons.Default.Face, contentDescription = null, tint = AtecBlue, modifier = Modifier.size(24.dp))
                }
            }
            Spacer(modifier = Modifier.width(16.dp))
            Column {
                Text(text = student.nome, style = MaterialTheme.typography.titleMedium, color = AtecText, fontWeight = FontWeight.Bold)
                Text(text = student.email, style = MaterialTheme.typography.bodyMedium, color = Color.Gray)
            }
        }
    }
}
