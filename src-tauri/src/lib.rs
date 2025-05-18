mod model;

use rusqlite::Connection;
use crate::model::Tarea;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![create_task, fetch_tasks, update_task, delete_task])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}


fn init_db() -> Result<Connection, rusqlite::Error> {
    let conn = Connection::open("../star-tasks.db")?;
    conn.execute("CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER primary key autoincrement, title TEXT, completed BOOLEAN)", [])?;
    Ok(conn)
}

#[tauri::command]
fn create_task(titulo: String) -> Result<(), String> {
    let conn = init_db().unwrap();
    log::info!("Creating task: {}", titulo);
    conn.execute("INSERT INTO tasks(title, completed) VALUES(?1, 0)", &[&titulo])
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn update_task(id: i32, completada: bool) -> Result<(), String> {
    let conn = init_db().map_err(|e| format!("Error al inicializar la BD: {}", e))?;
    conn.execute(
        "UPDATE tasks SET completed = ?1 WHERE id = ?2",
        &[&(completada as i32), &id],
    ).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn delete_task(id: i32) -> Result<(), String> {
    let conn = init_db().unwrap();
    conn.execute("DELETE FROM tasks WHERE id = ?1", &[&id]).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn fetch_tasks() -> Result<Vec<Tarea>, String> {
    let conn = init_db().unwrap();
    let mut stmt = conn.prepare("SELECT id, title, completed FROM tasks")
        .map_err(|e| e.to_string())?;
    let tasks = stmt.query_map([], |row| {
        Ok(Tarea {
            id: row.get(0)?,
            titulo: row.get(1)?,
            completada: row.get::<_, i32>(2)? != 0,
        })
    }).map_err(|e| e.to_string())?
        .filter_map(Result::ok)
        .collect();
    
    Ok(tasks)
}
