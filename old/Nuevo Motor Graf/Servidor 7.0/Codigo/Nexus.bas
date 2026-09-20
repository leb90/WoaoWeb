Attribute VB_Name = "Nexus"
Option Explicit
 
Public Type EventoNExus
    Activado As Boolean
    NpcCiuda As Integer
    NpcCrimi As Integer
    MapaEvento As Byte
    TiempoDeRonda As Byte
    Rondas As Byte
    CantidadJugadoresCIU As Byte
    CantidadJugadoresCRI As Byte
    CupoLlenoCIU As Boolean
    CupoLlenoCRI As Boolean
    RondaActual As Byte
    RondasGanadasCRI As Byte
    RondasGanadasCIU As Byte
End Type
 
Public Nexus As EventoNExus
Public DirectorioNexus As String
 
Dim JugadorACargar As String
Dim JugadorACargarINDEX As Integer
Dim CantidadMaxima As Byte
Dim Cargar As Byte
 
Public Sub CargaDatosNexus()
Nexus.NpcCiuda = Len(GetVar(App.Path & "\Server.ini", "NEXUS", "NpcCiuda"))
Nexus.NpcCrimi = Len(GetVar(App.Path & "\Server.ini", "NEXUS", "NpcCiuda"))
Nexus.MapaEvento = Len(GetVar(App.Path & "\Server.ini", "NEXUS", "MapaEvento"))
Nexus.TiempoDeRonda = Len(GetVar(App.Path & "\Server.ini", "NEXUS", "TiempoDeRonda"))
Nexus.Rondas = Len(GetVar(App.Path & "\Server.ini", "NEXUS", "CantidadRondas"))
Nexus.CantidadJugadoresCIU = Len(GetVar(App.Path & "\Server.ini", "NEXUS", "MaximoCiu"))
Nexus.CantidadJugadoresCRI = Len(GetVar(App.Path & "\Server.ini", "NEXUS", "MaximoCri"))
DirectorioNexus = App.Path & "\Nexus.txt"
End Sub
Public Sub RegistrarUnJugadorNExus(userindex As Integer)
Dim CantidadExistente As Byte
 
Select Case UserList(userindex).Faccion.Bando
 
    Case 1
        CantidadExistente = Len(GetVar(DirectorioNexus, "JUGADORESCIU", "CANTIDAD"))
        If CantidadExistente >= Nexus.CantidadJugadoresCIU Then
            Call SendData(ToIndex, userindex, 0, "Limite de jugadores ciudadanos alcanzado" & FONTTYPE_INFO)
            Nexus.CupoLlenoCIU = True
            Exit Sub
        End If
    
        Call WriteVar(DirectorioNexus, "JUGADORESCIU", "CANTIDAD", CantidadExistente + 1)
        Call WriteVar(DirectorioNexus, "JUGADORESCIU", "JUGADOR" & CantidadExistente + 1, UCase$(UserList(userindex).Name))
    Case 2
        CantidadExistente = Len(GetVar(DirectorioNexus, "JUGADORESCRI", "CANTIDAD"))
        If CantidadExistente >= Nexus.CantidadJugadoresCRI Then
            Call SendData(ToIndex, userindex, 0, "Limite de jugadores criminales alcanzado" & FONTTYPE_INFO)
            Nexus.CupoLlenoCRI = True
            Exit Sub
        End If
    
        Call WriteVar(DirectorioNexus, "JUGADORESCRI", "CANTIDAD", CantidadExistente + 1)
        Call WriteVar(DirectorioNexus, "JUGADORESCRI", "JUGADOR" & CantidadExistente + 1, UCase$(UserList(userindex).Name))
End Select
End Sub
 
Public Sub CargarJugadoresCIU()
 
CantidadMaxima = Len(GetVar(DirectorioNexus, "JUGADORESCIU", "CANTIDAD"))
 
For Cargar = 1 To CantidadMaxima
JugadorACargar = (GetVar(DirectorioNexus, "JUGADORESCIU", "JUGADOR" & Cargar))
JugadorACargarINDEX = NameIndex(JugadorACargar)
Call WarpUserChar(JugadorACargarINDEX, Nexus.MapaEvento, CAMBIAR, CAMBIAR, False)
Next Cargar
End Sub
 
Public Sub CargarJugadoresCRI()
 
CantidadMaxima = Len(GetVar(DirectorioNexus, "JUGADORESCRI", "CANTIDAD"))
 
For Cargar = 1 To CantidadMaxima
JugadorACargar = (GetVar(DirectorioNexus, "JUGADORESCRI", "JUGADOR" & Cargar))
JugadorACargarINDEX = NameIndex(JugadorACargar)
Call WarpUserChar(JugadorACargarINDEX, Nexus.MapaEvento, CAMBIAR, CAMBIAR, False)
Next Cargar
End Sub
 
Public Sub CalcularVidaNexus(NpcIndex As Integer, userindex As Integer)
Dim VidaTotal As Integer
Dim VidaActual As Integer
Dim PorcientoASaber As Byte
Dim Resultado As Integer
 
VidaTotal = Len(GetVar(App.Path & "\Dat\NPCs-HOSTILES.dat", "NPC" & Npclist(NpcIndex).numero, "MaxHP"))
VidaActual = Npclist(NpcIndex).Stats.MinHP
 
PorcientoASaber = 15
Resultado = PorcientoASaber * VidaTotal / 100
If VidaActual <= Resultado Then
    If UserList(userindex).Faccion.Bando = 1 Then
        Call SendData(ToMap, 0, Nexus.MapaEvento, "Nexus criminal al 15%" & FONTTYPE_WARNING)
        Exit Sub
    ElseIf UserList(userindex).Faccion.Bando = 2 Then
        Call SendData(ToMap, 0, Nexus.MapaEvento, "Nexus ciudadano al 15%" & FONTTYPE_WARNING)
        Exit Sub
    End If
    Exit Sub
End If
 
PorcientoASaber = 25
Resultado = PorcientoASaber * VidaTotal / 100
If VidaActual <= Resultado Then
    If UserList(userindex).Faccion.Bando = 1 Then
        Call SendData(ToMap, 0, Nexus.MapaEvento, "Nexus criminal al 35%" & FONTTYPE_WARNING)
        Exit Sub
    ElseIf UserList(userindex).Faccion.Bando = 2 Then
        Call SendData(ToMap, 0, Nexus.MapaEvento, "Nexus ciudadano al 35%" & FONTTYPE_WARNING)
        Exit Sub
    End If
    Exit Sub
End If
 
PorcientoASaber = 50
Resultado = PorcientoASaber * VidaTotal / 100
If VidaActual <= Resultado Then
    If UserList(userindex).Faccion.Bando = 1 Then
        Call SendData(ToMap, 0, Nexus.MapaEvento, "Nexus criminal al 50%" & FONTTYPE_WARNING)
        Exit Sub
    ElseIf UserList(userindex).Faccion.Bando = 2 Then
        Call SendData(ToMap, 0, Nexus.MapaEvento, "Nexus ciudadano al 50%" & FONTTYPE_WARNING)
        Exit Sub
    End If
    Exit Sub
End If
 
 
PorcientoASaber = 75
Resultado = PorcientoASaber * VidaTotal / 100
If VidaActual <= Resultado Then
    If UserList(userindex).Faccion.Bando = 1 Then
        Call SendData(ToMap, 0, Nexus.MapaEvento, "Nexus criminal al 75%" & FONTTYPE_WARNING)
        Exit Sub
    ElseIf UserList(userindex).Faccion.Bando = 2 Then
        Call SendData(ToMap, 0, Nexus.MapaEvento, "Nexus ciudadano al 75%" & FONTTYPE_WARNING)
        Exit Sub
    End If
    Exit Sub
End If
End Sub
 
Public Sub DevolverJugadoresNexusCIU()
CantidadMaxima = Len(GetVar(DirectorioNexus, "JUGADORESCIU", "CANTIDAD"))
 
For Cargar = 1 To CantidadMaxima
JugadorACargar = (GetVar(DirectorioNexus, "JUGADORESCIU", "JUGADOR" & Cargar))
JugadorACargarINDEX = NameIndex(JugadorACargar)
Call WarpUserChar(JugadorACargarINDEX, 1, 50, 50, False)
Next Cargar
End Sub
Public Sub DevolverJugadoresNexusCRI()
CantidadMaxima = Len(GetVar(DirectorioNexus, "JUGADORESCRI", "CANTIDAD"))
 
For Cargar = 1 To CantidadMaxima
JugadorACargar = (GetVar(DirectorioNexus, "JUGADORESCRI", "JUGADOR" & Cargar))
JugadorACargarINDEX = NameIndex(JugadorACargar)
Call WarpUserChar(JugadorACargarINDEX, 1, 50, 50, False)
Next Cargar
End Sub
Public Sub AcomodarNuevaRondaCRI()
CantidadMaxima = Len(GetVar(DirectorioNexus, "JUGADORESCRI", "CANTIDAD"))
 
For Cargar = 1 To CantidadMaxima
JugadorACargar = (GetVar(DirectorioNexus, "JUGADORESCRI", "JUGADOR" & Cargar))
JugadorACargarINDEX = NameIndex(JugadorACargar)
Call WarpUserChar(JugadorACargarINDEX, Nexus.MapaEvento, CAMBIAR, CAMBIAR, False)
Next Cargar
End Sub
Public Sub AcomodarNuevaRondaCIU()
CantidadMaxima = Len(GetVar(DirectorioNexus, "JUGADORESCIU", "CANTIDAD"))
 
For Cargar = 1 To CantidadMaxima
JugadorACargar = (GetVar(DirectorioNexus, "JUGADORESCIU", "JUGADOR" & Cargar))
JugadorACargarINDEX = NameIndex(JugadorACargar)
Call WarpUserChar(JugadorACargarINDEX, Nexus.MapaEvento, CAMBIAR, CAMBIAR, False)
Next Cargar
End Sub
Public Sub LlevarPosGanadoresCIU()
CantidadMaxima = Len(GetVar(DirectorioNexus, "JUGADORESCIU", "CANTIDAD"))
 
For Cargar = 1 To CantidadMaxima
JugadorACargar = (GetVar(DirectorioNexus, "JUGADORESCIU", "JUGADOR" & Cargar))
JugadorACargarINDEX = NameIndex(JugadorACargar)
Call WarpUserChar(JugadorACargarINDEX, Nexus.MapaEvento, CAMBIAR, CAMBIAR, False)
Next Cargar
End Sub
Public Sub LlevarPosGanadoresCRI()
CantidadMaxima = Len(GetVar(DirectorioNexus, "JUGADORESCRI", "CANTIDAD"))
 
For Cargar = 1 To CantidadMaxima
JugadorACargar = (GetVar(DirectorioNexus, "JUGADORESCRI", "JUGADOR" & Cargar))
JugadorACargarINDEX = NameIndex(JugadorACargar)
Call WarpUserChar(JugadorACargarINDEX, Nexus.MapaEvento, CAMBIAR, CAMBIAR, False)
Next Cargar
End Sub
Public Sub GananCiu()
Dim RondasRestantes As Integer
 
RondasRestantes = (Nexus.Rondas - Nexus.RondaActual)
 
If RondasRestantes = 0 Then
    If Nexus.RondasGanadasCRI > Nexus.RondasGanadasCIU Then
        Call SendData(ToAll, 0, 0, "||Los Criminales ganan el Destruye el Nexus!" & FONTTYPE_FENIX)
        Call DevolverJugadoresNexusCIU
        Call LlevarPosGanadoresCRI
        Call ReestablecerVariablesNexus
        Exit Sub
    Else
        Call SendData(ToAll, 0, 0, "||Los Ciudadanos ganan el Destruye el Nexus!" & FONTTYPE_FENIX)
        Call DevolverJugadoresNexusCRI
        Call LlevarPosGanadoresCIU
        Call ReestablecerVariablesNexus
        Exit Sub
    End If
End If
 
If RondasRestantes > 0 Then
    Call SendData(ToAll, 0, 0, "||Los ciudadanos ganan la ronda Nº: " & Nexus.RondaActual & " (" & Nexus.RondaActual & "/" & Nexus.Rondas & ")." & FONTTYPE_FENIX)
    Call AcomodarNuevaRondaCRI
    Call AcomodarNuevaRondaCIU
    Exit Sub
End If
 
End Sub
 
Public Sub GananCri()
Dim RondasRestantes As Integer
 
RondasRestantes = (Nexus.Rondas - Nexus.RondaActual)
 
If RondasRestantes = 0 Then
    If Nexus.RondasGanadasCIU > Nexus.RondasGanadasCRI Then
        Call DevolverJugadoresNexusCRI
        Call LlevarPosGanadoresCIU
        Call SendData(ToAll, 0, 0, "||Los Ciudadanos ganan el Destruye el Nexus!" & FONTTYPE_FENIX)
        Call ReestablecerVariablesNexus
        Exit Sub
    Else
        Call SendData(ToAll, 0, 0, "||Los Criminales ganan el Destruye el Nexus!" & FONTTYPE_FENIX)
        Call DevolverJugadoresNexusCIU
        Call LlevarPosGanadoresCRI
        Call ReestablecerVariablesNexus
        Exit Sub
    End If
End If
 
If RondasRestantes > 0 Then
    Call SendData(ToAll, 0, 0, "||Los criminales ganan la ronda Nº: " & Nexus.RondaActual & " (" & Nexus.RondaActual & "/" & Nexus.Rondas & ")." & FONTTYPE_FENIX)
    Call AcomodarNuevaRondaCRI
    Call AcomodarNuevaRondaCIU
    Nexus.RondasGanadasCRI = Nexus.RondasGanadasCRI + 1
    Exit Sub
End If
 
End Sub
Public Sub ReestablecerVariablesNexus()
    Nexus.Activado = False
    Nexus.CupoLlenoCIU = False
    Nexus.CupoLlenoCRI = False
    Nexus.RondaActual = 0
    Nexus.RondasGanadasCIU = 0
    Nexus.RondasGanadasCRI = 0
    Kill (DirectorioNexus)
End Sub
Public Sub CancelarEventoNexus()
    Call DevolverJugadoresNexusCRI
    Call DevolverJugadoresNexusCIU
    Call ReestablecerVariablesNexus
End Sub
Public Sub PonerNPCSNexus()
Dim Pos As WorldPos
 
Pos.Map = Nexus.MapaEvento
Pos.X = CAMBIAR
Pos.Y = CAMBIAR
If MapData(Pos).NpcIndex > 0 Then GoTo ciudas
Call SpawnNpc(Nexus.NpcCrimi, Pos, False, False)
 
ciudas:
Pos.Map = Nexus.MapaEvento
Pos.X = CAMBIAR
Pos.Y = CAMBIAR
If MapData(Pos).NpcIndex > 0 Then Exit Sub
Call SpawnNpc(Nexus.NpcCiuda, Pos, False, False)
 
End Sub
