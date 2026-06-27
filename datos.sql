
CREATE TABLE Usuarios (
    id_usuario INT PRIMARY KEY AUTOINCREMENT,
    nombre VARCHAR(100) NOT NULL
);


CREATE TABLE Shows (
    id_show INT PRIMARY KEY AUTOINCREMENT,
    pelicula VARCHAR(150) NOT NULL,
    fecha_hora DATETIME NOT NULL
);


CREATE TABLE Butacas (
    id_butaca INT PRIMARY KEY AUTOINCREMENT,
    id_show INT,
    numero_asiento VARCHAR(10) NOT NULL,
    estado VARCHAR(20) DEFAULT 'Disponible', -- 'Disponible', 'Bloqueada', 'Reservada'
    id_usuario INT NULL,
    inicio_bloqueo DATETIME NULL,
    FOREIGN KEY (id_show) REFERENCES Shows(id_show),
    FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario)
);


INSERT INTO Usuarios (id_usuario, nombre) VALUES (245, 'Usuario Prueba');
INSERT INTO Shows (id_show, pelicula, fecha_hora) VALUES (1, 'Avengers: Endgame', '2026-06-30 20:00:00');

-- Insertar un set de butacas para el show
INSERT INTO Butacas (id_show, numero_asiento, estado) VALUES 
(1, 'A1', 'Disponible'),
(1, 'A2', 'Disponible'),
(1, 'A3', 'Disponible'),
(1, 'A4', 'Disponible');