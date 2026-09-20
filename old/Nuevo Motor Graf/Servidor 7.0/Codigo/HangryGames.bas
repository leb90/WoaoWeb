Attribute VB_Name = "HangryGames"
Option Explicit

Public HungerGamesAC As Boolean
Public HungerGamesESP As Boolean

Sub HungerGames_Entra(ByVal Userindex As Integer)

    On Error GoTo errordm:

    If HungerGamesAC = False Then Exit Sub
    If HungerGamesESP = False Then
        Call SendData(ToIndex, 0, 0, "|/Juegos del Hambre" & "> " & _
                                     "El cupo de participación del evento está completo.")
        Exit Sub

    End If

    CantidadHungerGames = CantidadHungerGames + 1
    Call WarpUserChar(Userindex, 268, 40, 50, True)
    UserList(Userindex).flags.HungerGames = True

    If CantidadHungerGames = CantHungerGames Then
        Call SendData(ToAll, 0, 0, "|/Juegos del Hambre" & "> " & "¡Comienza el evento! ¡Suerte a los participantes!")
        TiempoHunger = 120
        HungerGamesESP = False
        Call HungerGames_Empieza

    End If

errordm:

End Sub

Sub HungerGames_Comienza(ByVal wetas As Integer)

    On Error GoTo errordm

    If HungerGamesAC = True Then
        Call SendData(ToAdmins, 0, 0, "|/Juegos del Hambre" & "> " & "Ya hay un evento de este tipo en curso.")
        Exit Sub

    End If

    If HungerGamesESP = True Then
        Call SendData(ToIndex, 0, 0, "|/Juegos del Hambre" & "> " & "¡El evento ha comenzado!")
        Exit Sub

    End If

    CantHungerGames = wetas

    Call SendData(ToAll, 0, 0, "|/Juegos del Hambre" & "> " & "Podrán entrar [" & CantHungerGames & _
                               "] jugadores ¡Si deseas ingresar envía /HUNGER!")

    HungerGamesAC = True
    HungerGamesESP = True

errordm:

End Sub

Sub HungerGames_Muere(ByVal Userindex As Integer)

    On Error GoTo errord

    CantidadHungerGames = CantidadHungerGames - 1
    Dim MiObj As obj

    If CantidadHungerGames = 1 Or MapInfo(269).NumUsers = 1 Then
        TerminoHungerGames = True
        Dim loopc As Integer

        For loopc = 1 To LastUser

            If UserList(loopc).flags.HungerGames = True And UserList(loopc).Pos.Map = 269 Then
                Call SendData(ToIndex, loopc, 0, "|/Juegos del Hambre" & "> " & _
                                                 "¡Ganaste los Juegos del Hambre! ¡Felicidades!")
                Call SendData(ToAll, 0, 0, "|/Juegos del Hambre" & "> ¡" & UserList(loopc).Name & _
                                           " ganó los Juegos del Hambre!")
                UserList(loopc).Stats.Puntos = UserList(loopc).Stats.Puntos + 100
                Call WarpUserChar(loopc, 34, 50, 50, True)
                
                Dim PuntosC As Integer
                PuntosC = UserList(Userindex).Stats.Puntos
                Call SendData(ToIndex, loopc, 0, "J5" & PuntosC)


                UserList(loopc).flags.HungerGames = False
                TerminoHungerGames = False
                HungerGamesESP = False
                HungerGamesAC = False
                CantidadHungerGames = 0

            End If

        Next

    End If

    'If CantidadHungerGames = 0 Or MapInfo(7).NumUsers = 0 Then
    'TerminoHungerGames = False
    'HungerGamesESP = False
    'HungerGamesAC = False
    'CantidadHungerGames = 0
    'Call SendData(ToAll, 0, 0, "|/Juegos del Hambre" & "> " & "¡El ganador se ha desconectado o muerto! ¡Que lastima!")
    'End If

errord:

End Sub

Sub HungerGames_Cancela()

    On Error GoTo errordm

    If HungerGamesAC = False And HungerGamesESP = False Then
        Exit Sub

    End If

    HungerGamesESP = False
    HungerGamesAC = False

    CantidadHungerGames = 0
    Call SendData(ToAll, 0, 0, "|/Juegos del Hambre" & "> " & "El evento ha sido cancelado.")

    Dim loopc As Integer

    For loopc = 1 To LastUser

        If UserList(loopc).flags.HungerGames = True And UserList(loopc).Pos.Map = 268 Or UserList(loopc).Pos.Map = 269 _
           Then
            Call WarpUserChar(loopc, 34, 50, 50, True)
            UserList(loopc).flags.HungerGames = False

        End If

    Next
errordm:

End Sub

Sub HungerGamesAuto_Cancela()

    On Error GoTo errordm

    If HungerGamesAC = False And HungerGamesESP = False Then
        Exit Sub

    End If

    HungerGamesESP = False
    HungerGamesAC = False
    CantidadHungerGames = 0
    Call SendData(ToAll, 0, 0, "|/Juegos del Hambre" & "> " & "El evento ha sido cancelado.")

    Dim loopc As Integer

    For loopc = 1 To LastUser

        If UserList(loopc).flags.HungerGames = True And UserList(loopc).Pos.Map = 268 Or UserList(loopc).Pos.Map = 269 _
           Then
            Call WarpUserChar(loopc, 34, 50, 50, True)
            UserList(loopc).flags.HungerGames = False

        End If

    Next
errordm:

End Sub

Sub HungerGames_Empieza()

    On Error GoTo errordm

    Dim loopc As Integer

    Dim PrimerArmadura As obj
    PrimerArmadura.ObjIndex = 31
    PrimerArmadura.Amount = 1

    Dim PrimerArmaduraE As obj
    PrimerArmaduraE.ObjIndex = 240
    PrimerArmaduraE.Amount = 1

    Dim PrimerArmaduraEM As obj
    PrimerArmaduraEM.ObjIndex = 31
    PrimerArmaduraEM.Amount = 1

    Dim PrimerArma As obj
    PrimerArma.ObjIndex = 756
    PrimerArma.Amount = 1

    Dim PrimerBacu As obj
    PrimerBacu.ObjIndex = 400
    PrimerBacu.Amount = 1

    Dim PrimerDaga As obj
    PrimerDaga.ObjIndex = 165
    PrimerDaga.Amount = 1

    Dim PrimerArco As obj
    PrimerArco.ObjIndex = 478
    PrimerArco.Amount = 1

    Dim PrimerFlecha As obj
    PrimerFlecha.ObjIndex = 480
    PrimerFlecha.Amount = 300

    Dim PrimerPotaRoja As obj
    PrimerPotaRoja.ObjIndex = 38
    PrimerPotaRoja.Amount = 75

    Dim PrimerPotaAzul As obj
    PrimerPotaAzul.ObjIndex = 37
    PrimerPotaAzul.Amount = 75

    Dim PrimerPotaAmar As obj
    PrimerPotaAmar.ObjIndex = 36
    PrimerPotaAmar.Amount = 10

    Dim PrimerPotaFuer As obj
    PrimerPotaFuer.ObjIndex = 39
    PrimerPotaFuer.Amount = 10

    For loopc = 1 To LastUser

        If UserList(loopc).Pos.Map = 268 And UserList(loopc).flags.HungerGames = True Then
            Call WarpUserChar(loopc, 49, 70, 70, True)    'Mapa donde se tiran las cosas
            Call TirarTodosLosItemsNoNewbies(loopc)    'Tirar las cosas
            Call WarpUserChar(loopc, 269, RandomNumber(45, 50), RandomNumber(58, 57), True)    'Mapa del evento
            Call MeterItemEnInventario(loopc, PrimerPotaRoja)    'Pociones Rojas
            Call MeterItemEnInventario(loopc, PrimerPotaAzul)    'Pociones Azules
            Call MeterItemEnInventario(loopc, PrimerPotaAmar)    'Pociones Amarillas
            Call MeterItemEnInventario(loopc, PrimerPotaFuer)    'Pociones Verdes

            If UserList(loopc).raza = "Humano" Or UserList(loopc).raza = "Elfo" Or UserList(loopc).raza = _
               "Elfo Oscuro" Or UserList(loopc).raza = "Orco" Or UserList(loopc).raza = "Abisario" Or UserList(loopc).raza = "Licantropos" Or UserList(loopc).raza = "NoMuerto" Or UserList(loopc).raza = "Tauros" Or UserList( _
               loopc).raza = "Vampiro" Then
                Call MeterItemEnInventario(loopc, PrimerArmadura)    'Ropa para Humanos
            ElseIf UserList(loopc).Genero = "Hombre" And UserList(loopc).raza = "Enano" Or UserList(loopc).raza = _
                   "Gnomo" Or UserList(loopc).raza = "Goblin" Then
                Call MeterItemEnInventario(loopc, PrimerArmaduraE)    'Ropa para Enanos/Gnomos HOMBRES
            ElseIf UserList(loopc).Genero = "Mujer" And UserList(loopc).raza = "Enano" Or UserList(loopc).raza = _
                   "Gnomo" Or UserList(loopc).raza = "Goblin" Then
                Call MeterItemEnInventario(loopc, PrimerArmaduraEM)    'Ropa para Enanos/Gnomos MUJERES

            End If

            If UserList(loopc).clase = "Paladin" Or UserList(loopc).clase = "Clerigo" Or UserList(loopc).clase = _
               "Guerrero" Or UserList(loopc).clase = "Pirata" Then
                Call MeterItemEnInventario(loopc, PrimerArma)    'Arma comun
            ElseIf UserList(loopc).clase = "Mago" Or UserList(loopc).clase = "Druida" Then
                Call MeterItemEnInventario(loopc, PrimerBacu)    'Baculo comun
            ElseIf UserList(loopc).clase = "Bardo" Or UserList(loopc).clase = "Asesino" Then
                Call MeterItemEnInventario(loopc, PrimerDaga)    'Daga comun
            ElseIf UserList(loopc).clase = "Cazador" Or UserList(loopc).clase = "Arquero" Then
                Call MeterItemEnInventario(loopc, PrimerArco)    'Arco comun
                Call MeterItemEnInventario(loopc, PrimerFlecha)    'Flecha comun

            End If

            If UserList(loopc).clase = "Guerrero" Or UserList(loopc).clase = "Arquero" Or UserList(loopc).clase = _
               "Pirata" Then
                Call MeterItemEnInventario(loopc, PrimerPotaRoja)    'Mas Pociones Rojas
                Call MeterItemEnInventario(loopc, PrimerPotaRoja)    'Mas Pociones Rojas
                Call MeterItemEnInventario(loopc, PrimerPotaAmar)    'Mas Pociones Amarillas
                Call MeterItemEnInventario(loopc, PrimerPotaFuer)    'Mas Pociones Verdes

            End If

        End If

    Next

errordm:

End Sub

Sub ObjetosDeCofre(ByVal NpcIndex As Integer, Userindex As Integer)

'Objetos Juegos del Hambre ARMAS
    Dim CofreArmaMago As obj
    CofreArmaMago.ObjIndex = 1037
    CofreArmaMago.Amount = 1
    Dim CofreArmaPala As obj
    CofreArmaPala.ObjIndex = 1056
    CofreArmaPala.Amount = 1
    Dim CofreArmaClero As obj
    CofreArmaClero.ObjIndex = 559
    CofreArmaClero.Amount = 1
    Dim CofreArmaBardo As obj
    CofreArmaBardo.ObjIndex = 559
    CofreArmaBardo.Amount = 1
    Dim CofreArmaAse As obj
    CofreArmaAse.ObjIndex = 1127
    CofreArmaAse.Amount = 1
    Dim CofreArmaCaza As obj
    CofreArmaCaza.ObjIndex = 844
    CofreArmaCaza.Amount = 1
    Dim CofreArmaArcher As obj
    CofreArmaArcher.ObjIndex = 844
    CofreArmaArcher.Amount = 1
    Dim CofreArmaGuerre As obj
    CofreArmaGuerre.ObjIndex = 836
    CofreArmaGuerre.Amount = 1
    Dim CofreArmaPira As obj
    CofreArmaPira.ObjIndex = 1056
    CofreArmaPira.Amount = 1
    'Objetos Juegos del Hambre ARMAS

    'Objetos Juegos del Hambre ARMADURAS
    Dim CofreArmaDMago As obj
    CofreArmaDMago.ObjIndex = 732
    CofreArmaDMago.Amount = 1
    Dim CofreArmaDPala As obj
    CofreArmaDPala.ObjIndex = 729
    CofreArmaDPala.Amount = 1
    Dim CofreArmaDClero As obj
    CofreArmaDClero.ObjIndex = 730
    CofreArmaDClero.Amount = 1
    Dim CofreArmaDBardo As obj
    CofreArmaDBardo.ObjIndex = 496
    CofreArmaDBardo.Amount = 1
    Dim CofreArmaDDruida As obj
    CofreArmaDDruida.ObjIndex = 731
    CofreArmaDDruida.Amount = 1
    Dim CofreArmaDAse As obj
    CofreArmaDAse.ObjIndex = 496
    CofreArmaDAse.Amount = 1
    Dim CofreArmaDCaza As obj
    CofreArmaDCaza.ObjIndex = 496
    CofreArmaDCaza.Amount = 1
    Dim CofreArmaDArcher As obj
    CofreArmaDArcher.ObjIndex = 496
    CofreArmaDArcher.Amount = 1
    Dim CofreArmaDGuerre As obj
    CofreArmaDGuerre.ObjIndex = 729
    CofreArmaDGuerre.Amount = 1
    Dim CofreArmaDMagoE As obj
    CofreArmaDMagoE.ObjIndex = 952
    CofreArmaDMagoE.Amount = 1
    Dim CofreArmaDPalaE As obj
    CofreArmaDPalaE.ObjIndex = 500
    CofreArmaDPalaE.Amount = 1
    Dim CofreArmaDCleroE As obj
    CofreArmaDCleroE.ObjIndex = 950
    CofreArmaDCleroE.Amount = 1
    Dim CofreArmaDBardoE As obj
    CofreArmaDBardoE.ObjIndex = 745
    CofreArmaDBardoE.Amount = 1
    Dim CofreArmaDDruidaE As obj
    CofreArmaDDruidaE.ObjIndex = 951
    CofreArmaDDruidaE.Amount = 1
    Dim CofreArmaDAseE As obj
    CofreArmaDAseE.ObjIndex = 745
    CofreArmaDAseE.Amount = 1
    Dim CofreArmaDCazaE As obj
    CofreArmaDCazaE.ObjIndex = 745
    CofreArmaDCazaE.Amount = 1
    Dim CofreArmaDArcherE As obj
    CofreArmaDArcherE.ObjIndex = 745
    CofreArmaDArcherE.Amount = 1
    Dim CofreArmaDGuerreE As obj
    CofreArmaDGuerreE.ObjIndex = 500
    CofreArmaDGuerreE.Amount = 1
    'Objetos Juegos del Hambre ARMADURAS

    'Objetos Juegos del Hambre Cascos
    Dim CofreCascoMago As obj
    CofreCascoMago.ObjIndex = 1223
    CofreCascoMago.Amount = 1
    Dim CofreCascoPala As obj
    CofreCascoPala.ObjIndex = 1088
    CofreCascoPala.Amount = 1
    Dim CofreCascoClero As obj
    CofreCascoClero.ObjIndex = 766
    CofreCascoClero.Amount = 1
    Dim CofreCascoBardo As obj
    CofreCascoBardo.ObjIndex = 766
    CofreCascoBardo.Amount = 1
    Dim CofreCascoDruida As obj
    CofreCascoDruida.ObjIndex = 1223
    CofreCascoDruida.Amount = 1
    Dim CofreCascoAse As obj
    CofreCascoAse.ObjIndex = 766
    CofreCascoAse.Amount = 1
    Dim CofreCascoCaza As obj
    CofreCascoCaza.ObjIndex = 765
    CofreCascoCaza.Amount = 1
    Dim CofreCascoArcher As obj
    CofreCascoArcher.ObjIndex = 765
    CofreCascoArcher.Amount = 1
    Dim CofreCascoGuerre As obj
    CofreCascoGuerre.ObjIndex = 764
    CofreCascoGuerre.Amount = 1
    Dim CofreCascoPira As obj
    CofreCascoPira.ObjIndex = 1077
    CofreCascoPira.Amount = 1
    'Objetos Juegos del Hambre Cascos

    'Objetos Juegos del Hambre Pociones Modificadoras
    Dim CofrePotaAgi As obj
    CofrePotaAgi.ObjIndex = 36
    CofrePotaAgi.Amount = 4
    Dim CofrePotaFue As obj
    CofrePotaFue.ObjIndex = 39
    CofrePotaFue.Amount = 4
    'Objetos Juegos del Hambre Pociones Modificadoras

    'Objetos Juegos del Hambre Pociones de Maná
    Dim CofrePotaMan As obj
    CofrePotaMan.ObjIndex = 37
    CofrePotaMan.Amount = 20
    'Objetos Juegos del Hambre Pociones de Maná

    'Objetos Juegos del Hambre Pociones de Vida
    Dim CofrePotaVid As obj
    CofrePotaVid.ObjIndex = 38
    CofrePotaVid.Amount = 20
    'Objetos Juegos del Hambre Pociones de Vida

    If Npclist(NpcIndex).numero = 732 Then    'Juegos del Hambre
        Call SendData(ToMap, 0, 269, "|/Juegos del Hambre" & "> " & UserList(Userindex).Name & _
                                     " encontró un Cofre Sorpresa de Armas.")

        If UserList(Userindex).clase = "Mago" Then
            Call TirarItemAlPiso(UserList(Userindex).Pos, CofreArmaMago)
        ElseIf UserList(Userindex).clase = "Paladin" Then
            Call TirarItemAlPiso(UserList(Userindex).Pos, CofreArmaPala)
        ElseIf UserList(Userindex).clase = "Clerigo" Then
            Call TirarItemAlPiso(UserList(Userindex).Pos, CofreArmaClero)
        ElseIf UserList(Userindex).clase = "Bardo" Then
            Call TirarItemAlPiso(UserList(Userindex).Pos, CofreArmaBardo)
        ElseIf UserList(Userindex).clase = "Druida" Then
            Call TirarItemAlPiso(UserList(Userindex).Pos, CofreArmaMago)
        ElseIf UserList(Userindex).clase = "Asesino" Then
            Call TirarItemAlPiso(UserList(Userindex).Pos, CofreArmaAse)
        ElseIf UserList(Userindex).clase = "Cazador" Then
            Call TirarItemAlPiso(UserList(Userindex).Pos, CofreArmaCaza)
        ElseIf UserList(Userindex).clase = "Arquero" Then
            Call TirarItemAlPiso(UserList(Userindex).Pos, CofreArmaArcher)
        ElseIf UserList(Userindex).clase = "Guerrero" Then
            Call TirarItemAlPiso(UserList(Userindex).Pos, CofreArmaPala)
        ElseIf UserList(Userindex).clase = "Pirata" Then
            Call TirarItemAlPiso(UserList(Userindex).Pos, CofreArmaPira)

        End If

    End If    'Juegos del Hambre NPC ARMAS

    If Npclist(NpcIndex).numero = 733 Then    'Juegos del Hambre NPC ARMADURAS
        Call SendData(ToMap, 0, 269, "|/Juegos del Hambre" & "> " & UserList(Userindex).Name & _
                                     " encontró un Cofre Sorpresa de Armaduras.")

        If UserList(Userindex).clase = "Mago" Then
            Call TirarItemAlPiso(UserList(Userindex).Pos, CofreArmaDMago)
            Call TirarItemAlPiso(UserList(Userindex).Pos, CofreArmaDMagoE)
        ElseIf UserList(Userindex).clase = "Paladin" Then
            Call TirarItemAlPiso(UserList(Userindex).Pos, CofreArmaDPala)
            Call TirarItemAlPiso(UserList(Userindex).Pos, CofreArmaDPalaE)
        ElseIf UserList(Userindex).clase = "Clerigo" Then
            Call TirarItemAlPiso(UserList(Userindex).Pos, CofreArmaDClero)
            Call TirarItemAlPiso(UserList(Userindex).Pos, CofreArmaDCleroE)
        ElseIf UserList(Userindex).clase = "Bardo" Then
            Call TirarItemAlPiso(UserList(Userindex).Pos, CofreArmaDBardo)
            Call TirarItemAlPiso(UserList(Userindex).Pos, CofreArmaDBardoE)
        ElseIf UserList(Userindex).clase = "Druida" Then
            Call TirarItemAlPiso(UserList(Userindex).Pos, CofreArmaDDruida)
            Call TirarItemAlPiso(UserList(Userindex).Pos, CofreArmaDDruidaE)
        ElseIf UserList(Userindex).clase = "Asesino" Then
            Call TirarItemAlPiso(UserList(Userindex).Pos, CofreArmaDAse)
            Call TirarItemAlPiso(UserList(Userindex).Pos, CofreArmaDAseE)
        ElseIf UserList(Userindex).clase = "Cazador" Then
            Call TirarItemAlPiso(UserList(Userindex).Pos, CofreArmaDCaza)
            Call TirarItemAlPiso(UserList(Userindex).Pos, CofreArmaDCazaE)
        ElseIf UserList(Userindex).clase = "Arquero" Then
            Call TirarItemAlPiso(UserList(Userindex).Pos, CofreArmaDArcher)
            Call TirarItemAlPiso(UserList(Userindex).Pos, CofreArmaDArcherE)
        ElseIf UserList(Userindex).clase = "Guerrero" Then
            Call TirarItemAlPiso(UserList(Userindex).Pos, CofreArmaDGuerre)
            Call TirarItemAlPiso(UserList(Userindex).Pos, CofreArmaDGuerreE)

        End If

        Exit Sub
    End If    'Juegos del Hambre NPC ARMADURAS

    If Npclist(NpcIndex).numero = 734 Then    'Juegos del Hambre NPC Cascos
        Call SendData(ToMap, 0, 269, "|/Juegos del Hambre" & "> " & UserList(Userindex).Name & _
                                     " encontró un Cofre Sorpresa de Cascos.")

        If UserList(Userindex).clase = "Mago" Then
            Call TirarItemAlPiso(UserList(Userindex).Pos, CofreCascoMago)
        ElseIf UserList(Userindex).clase = "Paladin" Then
            Call TirarItemAlPiso(UserList(Userindex).Pos, CofreCascoPala)
        ElseIf UserList(Userindex).clase = "Clerigo" Then
            Call TirarItemAlPiso(UserList(Userindex).Pos, CofreCascoClero)
        ElseIf UserList(Userindex).clase = "Bardo" Then
            Call TirarItemAlPiso(UserList(Userindex).Pos, CofreCascoBardo)
        ElseIf UserList(Userindex).clase = "Druida" Then
            Call TirarItemAlPiso(UserList(Userindex).Pos, CofreCascoDruida)
        ElseIf UserList(Userindex).clase = "Asesino" Then
            Call TirarItemAlPiso(UserList(Userindex).Pos, CofreCascoAse)
        ElseIf UserList(Userindex).clase = "Cazador" Then
            Call TirarItemAlPiso(UserList(Userindex).Pos, CofreCascoCaza)
        ElseIf UserList(Userindex).clase = "Arquero" Then
            Call TirarItemAlPiso(UserList(Userindex).Pos, CofreCascoArcher)
        ElseIf UserList(Userindex).clase = "GUERRERO" Then
            Call TirarItemAlPiso(UserList(Userindex).Pos, CofreCascoGuerre)
        ElseIf UserList(Userindex).clase = "PIRATA" Then
            Call TirarItemAlPiso(UserList(Userindex).Pos, CofreCascoPira)

        End If

        Exit Sub
    End If    'Juegos del Hambre NPC Cascos

    If Npclist(NpcIndex).numero = 735 Then    'Juegos del Hambre NPC Estadisticas
        Call SendData(ToMap, 0, 269, "|/Juegos del Hambre" & "> " & UserList(Userindex).Name & _
                                     " encontró un Cofre Sorpresa de Pociones Modificadoras.")
        Call TirarItemAlPiso(UserList(Userindex).Pos, CofrePotaFue)
        Call TirarItemAlPiso(UserList(Userindex).Pos, CofrePotaAgi)
        Exit Sub
    End If    'Juegos del Hambre NPC Estadisticas

    If Npclist(NpcIndex).numero = 736 Then    'Juegos del Hambre NPC Maná
        Call SendData(ToMap, 0, 269, "|/Juegos del Hambre" & "> " & UserList(Userindex).Name & _
                                     " encontró un Cofre Sorpresa de Pociones de Maná.")
        Call TirarItemAlPiso(UserList(Userindex).Pos, CofrePotaMan)
        Exit Sub
    End If    'Juegos del Hambre NPC Maná

    If Npclist(NpcIndex).numero = 737 Then    'Juegos del Hambre NPC Vida
        Call SendData(ToMap, 0, 269, "|/Juegos del Hambre" & "> " & UserList(Userindex).Name & _
                                     " encontró un Cofre Sorpresa de Pociones de Vida.")
        Call TirarItemAlPiso(UserList(Userindex).Pos, CofrePotaVid)
        Exit Sub
    End If    'Juegos del Hambre NPC Vida

End Sub
