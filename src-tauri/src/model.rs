use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct Tarea {
    pub(crate) id: i32,
    pub(crate) titulo: String,
    pub(crate) completada: bool
}