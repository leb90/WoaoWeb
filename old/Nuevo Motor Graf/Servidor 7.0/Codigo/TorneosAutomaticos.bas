Attribute VB_Name = "TorneosAutomaticos"
Option Explicit
Public Torneo_Activo As Boolean
Public Torneo_Esperando As Boolean
Private Torneo_Rondas As Integer
Private Torneo_Luchadores() As Integer
 
Private Const mapatorneo As Integer = 208
' esquinas superior isquierda del ring
Private Const esquina1x As Integer = 42
Private Const esquina1y As Integer = 42
' esquina inferior derecha del ring
Private Const esquina2x As Integer = 61
Private Const esquina2y As Integer = 57
' Donde esperan
Private Const esperax As Integer = 50
Private Const esperay As Integer = 75
' Mapa desconecta
Private Const mapa_fuera As Integer = 34
Private Const fueraesperay As Integer = 50
Private Const fueraesperax As Integer = 50
 ' estas son las pocisiones de las 2 esquinas de la zona de espera, en su mapa tienen que tener en la misma posicion las 2 esquinas.
Private Const X1 As Integer = 42
Private Const X2 As Integer = 59
Private Const Y1 As Integer = 73
Private Const Y2 As Integer = 77
Public UI1 As Integer
Public UI2 As Integer

Sub Torneoauto_Cancela()
On Error GoTo errorh:
    If (Not Torneo_Activo And Not Torneo_Esperando) Then Exit Sub
    Torneo_Activo = False
    Torneo_Esperando = False
    Call SendData(ToAll, 0, 0, "||El torneo fue cancelado por falta de participantes.")
    Dim i As Integer
     For i = LBound(Torneo_Luchadores) To UBound(Torneo_Luchadores)
                If (Torneo_Luchadores(i) <> -1) Then
                 Dim NuevaPos As WorldPos
                  Dim FuturePos As WorldPos
                    FuturePos.Map = mapa_fuera
                    FuturePos.X = fueraesperax: FuturePos.Y = fueraesperay
                    'Call ClosestLegalPos(FuturePos, NuevaPos)
                    If NuevaPos.X <> 0 And NuevaPos.Y <> 0 Then Call WarpUserChar(Torneo_Luchadores(i), NuevaPos.Map, NuevaPos.X, NuevaPos.Y, True)
                      UserList(Torneo_Luchadores(i)).flags.Automatico = False
                End If
        Next i
errorh:
End Sub
Sub Rondas_Cancela()
On Error GoTo errorh
    If (Not Torneo_Activo And Not Torneo_Esperando) Then Exit Sub
    Torneo_Activo = False
    Torneo_Esperando = False
    Call SendData(ToAll, 0, 0, "||Torneo fue cancelado por los administradores del juego. ")
    Dim i As Integer
    For i = LBound(Torneo_Luchadores) To UBound(Torneo_Luchadores)
                If (Torneo_Luchadores(i) <> -1) Then
                        Dim NuevaPos As WorldPos
                  Dim FuturePos As WorldPos
                    FuturePos.Map = mapa_fuera
                    FuturePos.X = fueraesperax: FuturePos.Y = fueraesperay
                    Call ClosestLegalPos(FuturePos, NuevaPos, 1)
                    If NuevaPos.X <> 0 And NuevaPos.Y <> 0 Then Call WarpUserChar(Torneo_Luchadores(i), NuevaPos.Map, NuevaPos.X, NuevaPos.Y, True)
                    UserList(Torneo_Luchadores(i)).flags.Automatico = False
                End If
        Next i
errorh:
End Sub
Sub Rondas_UsuarioMuere(ByVal Userindex As Integer, Optional Real As Boolean = True, Optional CambioMapa As Boolean = False)
On Error GoTo rondas_usuariomuere_errorh
        Dim i As Integer, Pos As Integer, j As Integer
        Dim combate As Integer, LI1 As Integer, LI2 As Integer
        
If (Not Torneo_Activo) Then
                Exit Sub
            ElseIf (Torneo_Activo And Torneo_Esperando) Then
                For i = LBound(Torneo_Luchadores) To UBound(Torneo_Luchadores)
                    If (Torneo_Luchadores(i) = Userindex) Then
                        Torneo_Luchadores(i) = -1
                        Call WarpUserChar(Userindex, mapa_fuera, fueraesperay, fueraesperax, True)
                         UserList(Userindex).flags.Automatico = False
                        Exit Sub
                    End If
                Next i
                Exit Sub
            End If
 
        For Pos = LBound(Torneo_Luchadores) To UBound(Torneo_Luchadores)
                If (Torneo_Luchadores(Pos) = Userindex) Then Exit For
        Next Pos
 
        ' si no lo ha encontrado
        If (Torneo_Luchadores(Pos) <> Userindex) Then Exit Sub
       
 '  Ojo con esta parte, aqui es donde verifica si el usuario esta en la posicion de espera del torneo, en estas cordenadas tienen que fijarse al crear su Mapa de torneos.
 
If UserList(Userindex).Pos.X >= X1 And UserList(Userindex).Pos.X <= X2 And UserList(Userindex).Pos.Y >= Y1 And UserList(Userindex).Pos.Y <= Y2 Then
Call SendData(ToAll, 0, 0, "||Torneo: " & UserList(Userindex).Name & " se desconecto en medio del torneo!")
Call WarpUserChar(Userindex, mapa_fuera, fueraesperax, fueraesperay, True)
UserList(Userindex).flags.Automatico = False
Torneo_Luchadores(Pos) = -1
Exit Sub
End If
 
        combate = 1 + (Pos - 1) \ 2
 
        'ponemos li1 y li2 (luchador index) de los que combatian
        LI1 = 2 * (combate - 1) + 1
        LI2 = LI1 + 1
 
        'se informa a la gente
        If (Real) Then
                Call SendData(ToAll, 0, 0, "||Torneo: " & UserList(Userindex).Name & " perdió el duelo!")
        Else
                Call SendData(ToAll, 0, 0, "||Torneo: " & UserList(Userindex).Name & " se desconecto en medio del torneo!@")
        End If
 
        'se le teleporta fuera si murio
        If (Real) Then
                Call WarpUserChar(Userindex, mapa_fuera, fueraesperax, fueraesperay, True)
                 UserList(Userindex).flags.Automatico = False
        ElseIf (Not CambioMapa) Then
             
                 Call WarpUserChar(Userindex, mapa_fuera, fueraesperax, fueraesperay, True)
                  UserList(Userindex).flags.Automatico = False
        End If
 
        'se le borra de la lista y se mueve el segundo a li1
        If (Torneo_Luchadores(LI1) = Userindex) Then
                Torneo_Luchadores(LI1) = Torneo_Luchadores(LI2) 'cambiamos slot
                Torneo_Luchadores(LI2) = -1
        Else
                Torneo_Luchadores(LI2) = -1
        End If
 
    'si es la ultima ronda
    If (Torneo_Rondas = 1) Then
    
        Call SendData(ToAll, 0, 0, "||GANADOR DEL TORNEO: " & UserList(Torneo_Luchadores(LI1)).Name)
        Call SendData(ToAll, 0, 0, "||PREMIO: Trofeo de Oro y 100 Puntos de Canje.")
        
        Dim medallaoro As obj
        medallaoro.Amount = 1
        medallaoro.ObjIndex = 1245
        
        If Not MeterItemEnInventario(Torneo_Luchadores(LI1), medallaoro) Then
            Call TirarItemAlPiso(UserList(Torneo_Luchadores(LI1)).Pos, medallaoro)
        End If
    
        'UserList(Torneo_Luchadores(LI1)).Stats.MedOro = UserList(Torneo_Luchadores(LI1)).Stats.MedOro + 1
        UserList(Torneo_Luchadores(LI1)).Stats.Puntos = UserList(Torneo_Luchadores(LI1)).Stats.Puntos + 100
        Call WarpUserChar(Torneo_Luchadores(LI1), mapa_fuera, fueraesperax, fueraesperay, True)
    
        'Call GRANK_User_Check(Events, UserList(Torneo_Luchadores(LI1)).Name, UserList(Torneo_Luchadores(LI1)).Stats.MedOro)
        'Call WriteVar(CharPath & UserList(Torneo_Luchadores(LI1)).Name & ".chr", "STATS", "MedOro", UserList(Torneo_Luchadores(LI1)).Stats.MedOro)
        
        Call SendData(ToIndex, Torneo_Luchadores(LI1), 0, "||Has ganado 100 puntos de torneo.")
        Dim PuntosC As Integer
        PuntosC = UserList(Torneo_Luchadores(LI1)).Stats.Puntos
        Call SendData(ToIndex, Torneo_Luchadores(LI1), 0, "J5" & PuntosC)
        'Call AgregarPuntos(Torneo_Luchadores(LI1), 50)
        'Call WriteVar(CharPath & UserList(Torneo_Luchadores(LI1)).Name & ".chr", "STATS", "Puntos", UserList(Torneo_Luchadores(LI1)).Stats.Puntos)
    
        UserList(Torneo_Luchadores(LI1)).flags.Automatico = False
        Torneo_Activo = False
        Exit Sub
    Else
        'a su compañero se le teleporta dentro, condicional por seguridad
        Call WarpUserChar(Torneo_Luchadores(LI1), 208, esperax, esperay, True)
    End If
 
               
        'si es el ultimo combate de la ronda
        If (2 ^ Torneo_Rondas = 2 * combate) Then
 
                Call SendData(ToAll, 0, 0, "||Próxima ronda!")
                Torneo_Rondas = Torneo_Rondas - 1
 
        'antes de llamar a la proxima ronda hay q copiar a los tipos
        For i = 1 To 2 ^ Torneo_Rondas
                UI1 = Torneo_Luchadores(2 * (i - 1) + 1)
                UI2 = Torneo_Luchadores(2 * i)
                If (UI1 = -1) Then UI1 = UI2
                Torneo_Luchadores(i) = UI1
        Next i
ReDim Preserve Torneo_Luchadores(1 To 2 ^ Torneo_Rondas) As Integer
        Call Rondas_Combate(1)
        Exit Sub
        End If
 
        'vamos al siguiente combate
        Call Rondas_Combate(combate + 1)
rondas_usuariomuere_errorh:
 
End Sub
 
 
 
Sub Rondas_UsuarioDesconecta(ByVal Userindex As Integer)
On Error GoTo errorh
Call SendData(ToAll, 0, 0, "||Torneo: " & UserList(Userindex).Name & " se desconecto en medio del torneo!")
Call Rondas_UsuarioMuere(Userindex, False, False)
errorh:
End Sub
Sub Rondas_UsuarioCambiamapa(ByVal Userindex As Integer)
On Error GoTo errorh
        Call Rondas_UsuarioMuere(Userindex, False, True)
errorh:
End Sub
 
Sub Torneos_Inicia(ByVal Userindex As Integer, ByVal rondas As Integer)
On Error GoTo errorh
        If (Torneo_Activo) Then
                Call SendData(ToIndex, Userindex, 0, "||Ya hay un torneo en curso!")
                Exit Sub
        End If
        
        Call SendData(ToAll, 0, 0, "||" & UserList(Userindex).Name & " ESTA ORGANIZANDO UN TORNEO 1 VS 1 PARA " & val(2 ^ rondas) & " PARTICIPANTES, EL NIVEL MINIMO PARA INGRESAR ES 25, PARA PARTICIPAR ESCRIBE /PARTICIPAR EN CONSOLA.")
        CuentaAutomatico = 10
        Call SendData(ToAll, 0, 0, "TW48")
       
        Torneo_Rondas = rondas
        Torneo_Esperando = True
 
        ReDim Torneo_Luchadores(1 To 2 ^ rondas) As Integer
        Dim i As Integer
        For i = LBound(Torneo_Luchadores) To UBound(Torneo_Luchadores)
                Torneo_Luchadores(i) = -1
        Next i
errorh:
End Sub
 
 
 
Sub Torneos_Entra(ByVal Userindex As Integer)
On Error GoTo errorh
        Dim i As Integer
       
        If (Not Torneo_Activo) Then
                Call SendData(ToIndex, Userindex, 0, "||No hay ningun torneo en este momento!")
                Exit Sub
        End If
        
            If UserList(Userindex).Pos.Map = 78 Or UserList(Userindex).Pos.Map = 100 Or UserList(Userindex).Pos.Map = 107 Or MapInfo(UserList(Userindex).Pos.Map).Pk = True Or UserList(Userindex).Pos.Map = 110 Or UserList(Userindex).Pos.Map = 109 Or UserList(Userindex).Pos.Map = 108 Or UserList(Userindex).Pos.Map = 106 Or UserList(Userindex).Pos.Map = 71 Or UserList(Userindex).Pos.Map = 118 Or UserList(Userindex).Pos.Map = 120 Then
                    Call SendData(ToIndex, Userindex, 0, "||Desde aqui no puedes realizar esta acción." & "´" & FontTypeNames.FONTTYPE_talk)
                Exit Sub
            End If
            
        If UserList(Userindex).flags.Muerto = 1 Then
            Call SendData(ToIndex, Userindex, 0, "||¡Estás muerto!")
          Exit Sub
        End If
        
        If (Not Torneo_Esperando) Then
                Call SendData(ToIndex, Userindex, 0, "||El torneo ya empezó, te quedaste fuera!")
                Exit Sub
        End If
        
        If UserList(Userindex).flags.Muerto = 1 Then Exit Sub
       
        For i = LBound(Torneo_Luchadores) To UBound(Torneo_Luchadores)
                If (Torneo_Luchadores(i) = Userindex) Then
                        Call SendData(ToIndex, Userindex, 0, "||Ya estas inscripto!")
                        Exit Sub
                End If
        Next i
 
        For i = LBound(Torneo_Luchadores) To UBound(Torneo_Luchadores)
        If (Torneo_Luchadores(i) = -1) Then
                Torneo_Luchadores(i) = Userindex
                 Dim NuevaPos As WorldPos
                  Dim FuturePos As WorldPos
                    FuturePos.Map = 208
                    FuturePos.X = RandomNumber(42, 59): FuturePos.Y = RandomNumber(73, 77)
                    Call ClosestLegalPos(FuturePos, NuevaPos, 1)
                    'ClosestLegalPos(MapData(Map, X, Y).TileExit, nPos, 0)
                   
                    If NuevaPos.X <> 0 And NuevaPos.Y <> 0 Then Call WarpUserChar(Torneo_Luchadores(i), NuevaPos.Map, NuevaPos.X, NuevaPos.Y, True)
                 UserList(Torneo_Luchadores(i)).flags.Automatico = True
                 
                Call SendData(ToIndex, Userindex, 0, "||Estas dentro del torneo!")
               
                Call SendData(ToAll, 0, 0, "||Torneo: " & UserList(Userindex).Name & " se inscribió al torneo.")
                If (i = UBound(Torneo_Luchadores)) Then
                Call SendData(ToAll, 0, 0, "||Comienza el torneo!")
                Torneo_Esperando = False
                Call Rondas_Combate(1)
     
                End If
                  Exit Sub
        End If
        Next i
errorh:
End Sub
 
 
Sub Rondas_Combate(combate As Integer)
On Error GoTo errorh

    UI1 = Torneo_Luchadores(2 * (combate - 1) + 1)
    UI2 = Torneo_Luchadores(2 * combate)
   
    If (UI2 = -1) Then
        UI2 = Torneo_Luchadores(2 * (combate - 1) + 1)
        UI1 = Torneo_Luchadores(2 * combate)
    End If
   
    If (UI1 = -1) Then
        Call SendData(ToAll, 0, 0, "||Combate anulado porque alguno de los 2 participantes se desconecto.")
        If (Torneo_Rondas = 1) Then
            If (UI2 <> -1) Then
                Call SendData(ToAll, 0, 0, "||Torneo terminado, ganador del torneo por eliminacion: " & UserList(UI2).Name)
                UserList(UI2).flags.Automatico = False
                ' dale_recompensa()
                Torneo_Activo = False
                Exit Sub
            End If
            Call SendData(ToAll, 0, 0, "||Torneo terminado, no hay ganador porque todos se fueron.")
            Exit Sub
        End If
        If (UI2 <> -1) Then _
            Call SendData(ToAll, 0, 0, "||Torneo: " & UserList(UI2).Name & " pasa a la siguiente ronda!")
   
        If (2 ^ Torneo_Rondas = 2 * combate) Then
            Call SendData(ToAll, 0, 0, "||Siguiente ronda!")
            Torneo_Rondas = Torneo_Rondas - 1
            'antes de llamar a la proxima ronda hay q copiar a los tipos
            Dim i As Integer, j As Integer
            For i = 1 To 2 ^ Torneo_Rondas
                UI1 = Torneo_Luchadores(2 * (i - 1) + 1)
                UI2 = Torneo_Luchadores(2 * i)
                If (UI1 = -1) Then UI1 = UI2
                Torneo_Luchadores(i) = UI1
            Next i
            ReDim Preserve Torneo_Luchadores(1 To 2 ^ Torneo_Rondas) As Integer
            Call Rondas_Combate(1)
            Exit Sub
        End If
        Call Rondas_Combate(combate + 1)
        Exit Sub
    End If
 
    'UserList(UI1).Stats.MinHP = UserList(UI1).Stats.MaxHP
    'UserList(UI2).Stats.MinHP = UserList(UI2).Stats.MaxHP
    'UserList(UI1).Stats.MinMAN = UserList(UI1).Stats.MaxMAN
    'UserList(UI2).Stats.MinMAN = UserList(UI2).Stats.MaxMAN
    'SendUserHP (UI1)
    'SendUserMP (UI1)
    
    'SendUserHP (UI2)
    'SendUserMP (UI2)
    
    Call SendData(ToAll, 0, 0, "||" & UserList(UI1).Name & " VS " & UserList(UI2).Name)
 
    Call WarpUserChar(UI1, mapatorneo, esquina1x, esquina1y, True)
    Call WarpUserChar(UI2, mapatorneo, esquina2x, esquina2y, True)
    TimeTorneo = 10
    Call SendData2(ToIndex, UI1, 0, 19)
    Call SendData2(ToIndex, UI2, 0, 19)
    
errorh:
End Sub
