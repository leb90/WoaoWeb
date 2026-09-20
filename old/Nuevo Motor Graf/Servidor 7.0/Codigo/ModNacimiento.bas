Attribute VB_Name = "ModNacimiento"

'pluto:2.15
Function ComprobarNombreBebe(Namebebe As String, _
                             Userindex As Integer, _
                             Genero As String) As Boolean
'Dim Namebebe As String

'pluto:2.24
    Namebebe = Trim$(Namebebe)

    If Not NombrePermitido(Namebebe) Then
        Call SendData2(ToIndex, Userindex, 0, 43, _
                       "Los nombres de los personajes deben pertencer a la fantasia, el nombre indicado es invalido.")
        Exit Function

    End If

    '[Tite]Bug clon fichas. Se copiaba una ficha a la cuenta de papa o mama poniendo un espacio delante del nick al darle nombre.
    'Dim i As Integer
    'i = 1
    'Do While Right$(Left$(Namebebe, i), 1) = Chr(32) And i <= Len(Namebebe)
    '   If Left$(Namebebe, 1) = Chr(32) Then
    '  Namebebe = Right$(Namebebe, Len(Namebebe) - 1)
    ' Else
    'i = i + 1
    'End If
    'Loop

    '[\Tite]

    If Len(Namebebe) > 15 Or Len(Namebebe) < 4 Then
        Call SendData2(ToIndex, Userindex, 0, 43, "Nombre demasiado largo o demasiado corto.")
        Exit Function

    End If

    If Not AsciiValidos(Namebebe) Then
        Call SendData2(ToIndex, Userindex, 0, 43, "Nombre invalido.")
        Exit Function

    End If

    If PersonajeExiste(Namebebe) Then
        Call SendData2(ToIndex, Userindex, 0, 43, "Ya existe el personaje.")
        Exit Function

    End If

    ComprobarNombreBebe = True
    Call Nacimiento(Userindex, Namebebe, Genero)

End Function

Sub Nacimiento(Userindex As Integer, Namebebe As String, Genero As String)

    Dim Qui As Byte
    Dim Dueño As String
    Dim Tindex As Integer
    Dim raza As String
    'Dim Genero As String
    Dim py As Byte
    Dim px As Byte
    Dim pmap As Integer

    Tindex = NameIndex(UserList(Userindex).Esposa)

    Qui = RandomNumber(1, 10)

    If Qui > 5 Then
        Dueño = UserList(Userindex).Email
        py = UserList(Userindex).Pos.Y
        px = UserList(Userindex).Pos.X
        pmap = py = UserList(Userindex).Pos.Map
    Else
        Dueño = UserList(Tindex).Email
        py = UserList(Tindex).Pos.Y
        px = UserList(Tindex).Pos.X
        pmap = py = UserList(Tindex).Pos.Map

    End If

    Dim archiv As String
    archiv = App.Path & "\Accounts\" & Dueño & ".acc"

    'SEGUIMOS UNA VEZ SABEMOS A QUE FICHA INTRODUCIR EL PJ (DUEÑO)

    'si es para la mamá que debe estar online
    If Qui > 5 Then
        Cuentas(Userindex).NumPjs = Cuentas(Userindex).NumPjs + 1
        ReDim Preserve Cuentas(Userindex).Pj(1 To Cuentas(Userindex).NumPjs)
        Cuentas(Userindex).Pj(Cuentas(Userindex).NumPjs) = Namebebe
        'Call MandaPersonajes(UserIndex)
    Else

        'si es para el papá que debe estar online
        If NameIndex(UserList(Userindex).Esposa) > 0 Then
            Cuentas(Tindex).NumPjs = Cuentas(Tindex).NumPjs + 1
            ReDim Preserve Cuentas(Tindex).Pj(1 To Cuentas(Tindex).NumPjs)
            Cuentas(Tindex).Pj(Cuentas(Tindex).NumPjs) = Namebebe

            'Call MandaPersonajes(tindex)
        End If

    End If

    '----si no ta online
    Dim Num8 As Byte
    Dim num9 As Byte
    UserList(Userindex).Embarazada = 0
    UserList(Userindex).Nhijos = UserList(Userindex).Nhijos + 1
    UserList(Userindex).Hijo(val(UserList(Userindex).Nhijos)) = Namebebe
    UserList(Userindex).NombreDelBebe = ""
    UserList(Tindex).Nhijos = UserList(Tindex).Nhijos + 1
    UserList(Tindex).Hijo(val(UserList(Tindex).Nhijos)) = Namebebe
    UserList(Tindex).NombreDelBebe = ""

    'Dim num7 As Byte
    'Num8 = val(GetVar(archiv, "DATOS", "Numpjs"))
    'Call WriteVar(archiv, "DATOS", "NumPjs", CStr(Num8 + 1))
    'Call WriteVar(archiv, "PERSONAJES", "PJ" & CStr(Num8 + 1), Namebebe)
    'num7 = val(GetVar(archiv, "INIT", "Nhijos")) + 1
    'Call WriteVar(archiv, "INIT", "Nhijos", val(num7))
    'Call WriteVar(archiv, "INIT", "Hijo" & num7, Namebebe)

    'aleatorios papá y mamá
    Num8 = RandomNumber(1, 2)

    'num9 = RandomNumber(1, 2)
    If Num8 = 1 Then raza = UserList(Userindex).raza Else raza = UserList(Tindex).raza
    'If num9 = 1 Then Genero = "Hombre" Else Genero = "Mujer"
    Dim pa As String

    If Qui > 5 Then pa = "Madre " & UserList(Userindex).Name Else pa = "Padre " & UserList(Tindex).Name
    Call SendData(ToIndex, Userindex, 0, _
                  "!! La matrona ha decidido en esta ocasión que la custodia del bebé corresponde a su " & pa & _
                  " que a partir de esos momentos será el encargado de su entrenamiento.")
    Call SendData(ToIndex, Tindex, 0, _
                  "!! La matrona ha decidido en esta ocasión que la custodia del bebé corresponde a su " & pa & _
                  " que a partir de esos momentos será el encargado de su entrenamiento.")

    Call CreaBebe(Namebebe, Dueño, raza, Genero, py, pmap, px, UserList(Userindex).Stats.ELV, UserList( _
                                                                                              Tindex).Stats.ELV, UserList(Userindex).raza, UserList(Tindex).raza, UserList(Tindex).Name, UserList( _
                                                                                                                                                                                         Userindex).Name)

End Sub

Sub CreaBebe(Namebebe As String, Dueño As String, raza As String, Genero As String, py As Byte, pmap As Integer, px _
                                                                                                                 As Byte, ax3 As Byte, ax4 As Byte, ax1 As String, ax2 As String, a5 As String, a6 As String)

    On Error GoTo errhandler

    Dim loopc As Integer
    Dim UserFile As String

    UserFile = CharPath & Left$(Namebebe, 1) & "\" & UCase$(Namebebe) & ".chr"

    Call WriteVar(UserFile, "FLAGS", "Muerto", 0)
    Call WriteVar(UserFile, "FLAGS", "Escondido", 0)

    Call WriteVar(UserFile, "FLAGS", "Hambre", 0)
    Call WriteVar(UserFile, "FLAGS", "Sed", 0)
    Call WriteVar(UserFile, "FLAGS", "Desnudo", 1)
    Call WriteVar(UserFile, "FLAGS", "Ban", 0)
    Call WriteVar(UserFile, "FLAGS", "Navegando", 0)

    Call WriteVar(UserFile, "FLAGS", "Montura", 0)
    Call WriteVar(UserFile, "FLAGS", "ClaseMontura", 0)

    Call WriteVar(UserFile, "FLAGS", "Envenenado", 0)
    Call WriteVar(UserFile, "FLAGS", "Paralizado", 0)
    Call WriteVar(UserFile, "FLAGS", "Morph", 0)

    Call WriteVar(UserFile, "FLAGS", "Angel", 0)
    Call WriteVar(UserFile, "FLAGS", "Demonio", 0)

    Call WriteVar(UserFile, "COUNTERS", "Pena", 0)

    Call WriteVar(UserFile, "FACCIONES", "EjercitoReal", 0)
    Call WriteVar(UserFile, "FACCIONES", "EjercitoCaos", 0)
    Call WriteVar(UserFile, "FACCIONES", "CiudMatados", 0)
    Call WriteVar(UserFile, "FACCIONES", "CrimMatados", 0)
    Call WriteVar(UserFile, "FACCIONES", "rArCaos", 0)
    Call WriteVar(UserFile, "FACCIONES", "rArReal", 0)

    Call WriteVar(UserFile, "FACCIONES", "rArLegion", 0)
    Call WriteVar(UserFile, "FACCIONES", "rExCaos", 0)
    Call WriteVar(UserFile, "FACCIONES", "rExReal", 0)
    Call WriteVar(UserFile, "FACCIONES", "recCaos", 0)
    Call WriteVar(UserFile, "FACCIONES", "recReal", 0)

    Call WriteVar(UserFile, "GUILD", "EsGuildLeader", 0)
    Call WriteVar(UserFile, "GUILD", "Echadas", 0)
    Call WriteVar(UserFile, "GUILD", "Solicitudes", 0)
    Call WriteVar(UserFile, "GUILD", "SolicitudesRechazadas", 0)
    Call WriteVar(UserFile, "GUILD", "VecesFueGuildLeader", 0)
    Call WriteVar(UserFile, "GUILD", "YaVoto", 0)
    Call WriteVar(UserFile, "GUILD", "FundoClan", 0)

    Call WriteVar(UserFile, "STATS", "PClan", 0)
    Call WriteVar(UserFile, "STATS", "GTorneo", 0)

    Call WriteVar(UserFile, "GUILD", "GuildName", "")
    Call WriteVar(UserFile, "GUILD", "ClanFundado", "")
    Call WriteVar(UserFile, "GUILD", "ClanesParticipo", "")
    Call WriteVar(UserFile, "GUILD", "GuildPts", "")

    Dim Jur As Byte
    Dim Jar As Byte
    Dim Pote As Byte
    'calculo potencial del bebé
    'media de niveles papis
    Jar = (ax3 + ax4) / 2
    'suma bonus por niveles papis
    Pote = 1

    If Jar > 10 Then Pote = Pote + 1
    If Jar > 15 Then Pote = Pote + 1
    If Jar > 20 Then Pote = Pote + 1
    If Jar > 25 Then Pote = Pote + 1
    If Jar > 30 Then Pote = Pote + 1
    If Jar > 35 Then Pote = Pote + 1
    If Jar > 40 Then Pote = Pote + 1
    If Jar > 45 Then Pote = Pote + 1
    If Jar > 50 Then Pote = Pote + 1
    If Jar > 55 Then Pote = Pote + 1

    'calcula atributos
    For loopc = 1 To 5
        Jur = 12
        'Jur = 8 + RandomNumber(1, 3)

        'suma bonus por raza
        Select Case UCase$(raza)

        Case "HUMANO"

            If loopc = 1 Then Jur = Jur + 2
            If loopc = 2 Then Jur = Jur + 1
            If loopc = 5 Then Jur = Jur + 2
            If loopc = 4 Then Jur = Jur + 1

        Case "ELFO"

            If loopc = 2 Then Jur = Jur + 2
            If loopc = 3 Then Jur = Jur + 1
            If loopc = 4 Then Jur = Jur + 2

        Case "ELFO OSCURO"

            If loopc = 1 Then Jur = Jur + 1
            If loopc = 2 Then Jur = Jur + 2
            If loopc = 3 Then Jur = Jur + 2
            If loopc = 4 Then Jur = Jur + 2

        Case "ENANO"

            If loopc = 1 Then Jur = Jur + 3
            If loopc = 5 Then Jur = Jur + 3
            If loopc = 3 Then Jur = Jur - 1

        Case "GNOMO"

            If loopc = 1 Then Jur = Jur - 1
            If loopc = 2 Then Jur = Jur + 3
            If loopc = 3 Then Jur = Jur + 3

        Case "ORCO"

            If loopc = 1 Then Jur = Jur + 4
            If loopc = 5 Then Jur = Jur + 3
            If loopc = 3 Then Jur = Jur - 6
            If loopc = 2 Then Jur = Jur - 2

        Case "VAMPIRO"

            If loopc = 1 Then Jur = Jur + 2
            If loopc = 5 Then Jur = Jur + 1
            If loopc = 3 Then Jur = Jur + 1
            If loopc = 2 Then Jur = Jur + 2

        Case "TAUROS"

            If loopc = 1 Then Jur = Jur + 2
            If loopc = 5 Then Jur = Jur + 1
            If loopc = 3 Then Jur = Jur + 1
            If loopc = 2 Then Jur = Jur + 2
            
        Case "LICANTROPOS"

            If loopc = 1 Then Jur = Jur + 2
            If loopc = 5 Then Jur = Jur + 1
            If loopc = 3 Then Jur = Jur + 1
            If loopc = 2 Then Jur = Jur + 2
            
        Case "NOMUERTO"

            If loopc = 1 Then Jur = Jur + 2
            If loopc = 5 Then Jur = Jur + 1
            If loopc = 3 Then Jur = Jur + 1
            If loopc = 2 Then Jur = Jur + 2

        End Select

        Call WriteVar(UserFile, "ATRIBUTOS", "AT" & loopc, val(Jur))
    Next

    For loopc = 1 To 20
        Call WriteVar(UserFile, "SKILLS", "SK" & loopc, 0)
    Next

    Call WriteVar(UserFile, "CONTACTO", "Email", Dueño)
    'pluto:2.10
    Call WriteVar(UserFile, "CONTACTO", "EmailActual", Dueño)

    Call WriteVar(UserFile, "INIT", "Genero", Genero)
    Call WriteVar(UserFile, "INIT", "Raza", raza)
    'pluto:2.18------------------
    Dim hog As String

    Select Case UCase$(raza)

    Case "HUMANO"
        hog = "ALDEA DE HUMANOS"

    Case "ENANO"
        hog = "POBLADO ENANO"

    Case "VAMPIRO"
        hog = "ALDEA DE VAMPIROS"

    Case "GNOMO"
        hog = "ALDEA DE GNOMOS"

    Case "ORCO"
        hog = "POBLADO ORCO"

    Case "ELFO"
        hog = "ALDEA ÉLFICA"

    Case "ELFO OSCURO"
        hog = "ALDEA ÉLFICA"
        
    Case "GOBLIN"
        hog = "ALDEA ÉLFICA"
        
    Case "ABISARIO"
        hog = "ALDEA ÉLFICA"
        
    Case "TAUROS"
        hog = "ALDEA ÉLFICA"
        
    Case "LICANTROPOS"
        hog = "ALDEA ÉLFICA"
        
    Case "NOMUERTO"
        hog = "ALDEA ÉLFICA"

    End Select

    '-----------------------------
    Call WriteVar(UserFile, "INIT", "Hogar", hog)
    Call WriteVar(UserFile, "INIT", "Clase", "Niño")
    Call WriteVar(UserFile, "INIT", "Desc", "Soy un bebe")
    Call WriteVar(UserFile, "INIT", "Heading", 3)
    Call WriteVar(UserFile, "INIT", "Head", 0)

    If raza = "Elfo Oscuro" Or raza = "Vampiro" Then
        Call WriteVar(UserFile, "INIT", "Body", 342)
    ElseIf raza = "Orco" Then
        Call WriteVar(UserFile, "INIT", "Body", 341)
    ElseIf raza = "Abisario" Then
        Call WriteVar(UserFile, "INIT", "Body", 490)
    Else
        Call WriteVar(UserFile, "INIT", "Body", 340)

    End If

    Call WriteVar(UserFile, "INIT", "Arma", 0)
    Call WriteVar(UserFile, "INIT", "Escudo", 0)
    Call WriteVar(UserFile, "INIT", "Casco", 0)
    '[GAU]
    Call WriteVar(UserFile, "INIT", "Botas", 0)
    '[GAU]
    Call WriteVar(UserFile, "INIT", "RAZAREMORT", 0)
    Call WriteVar(UserFile, "INIT", "LastIP", "")

    Call WriteVar(UserFile, "INIT", "LastSerie", "")
    Call WriteVar(UserFile, "INIT", "LastMac", "")
    Call WriteVar(UserFile, "INIT", "Position", pmap & "-" & px & "-" & py)

    Call WriteVar(UserFile, "INIT", "Esposa", "")
    Call WriteVar(UserFile, "INIT", "Nhijos", 0)

    For X = 1 To 5
        Call WriteVar(UserFile, "INIT", "Hijo" & X, "")
    Next
    Call WriteVar(UserFile, "INIT", "Amor", 0)
    Call WriteVar(UserFile, "INIT", "Embarazada", 0)
    Call WriteVar(UserFile, "INIT", "Bebe", val(Pote))
    Call WriteVar(UserFile, "INIT", "NombreDelBebe", "")
    Call WriteVar(UserFile, "INIT", "Padre", a5)
    Call WriteVar(UserFile, "INIT", "Madre", a6)

    Call WriteVar(UserFile, "STATS", "PUNTOS", 0)

    Call WriteVar(UserFile, "STATS", "GLD", 0)
    Call WriteVar(UserFile, "STATS", "REMORT", 0)
    Call WriteVar(UserFile, "STATS", "BANCO", 0)

    Call WriteVar(UserFile, "STATS", "MET", 1)
    Call WriteVar(UserFile, "STATS", "MaxHP", 5)
    Call WriteVar(UserFile, "STATS", "MinHP", 5)

    Call WriteVar(UserFile, "STATS", "FIT", 10)
    Call WriteVar(UserFile, "STATS", "MaxSTA", 60)
    Call WriteVar(UserFile, "STATS", "MinSTA", 60)

    Call WriteVar(UserFile, "STATS", "MaxMAN", 0)
    Call WriteVar(UserFile, "STATS", "MinMAN", 0)

    Call WriteVar(UserFile, "STATS", "MaxHIT", 2)
    Call WriteVar(UserFile, "STATS", "MinHIT", 1)

    Call WriteVar(UserFile, "STATS", "MaxAGU", 100)
    Call WriteVar(UserFile, "STATS", "MinAGU", 100)

    Call WriteVar(UserFile, "STATS", "MaxHAM", 100)
    Call WriteVar(UserFile, "STATS", "MinHAM", 100)

    Call WriteVar(UserFile, "STATS", "SkillPtsLibres", 0)

    Call WriteVar(UserFile, "STATS", "EXP", 0)
    Call WriteVar(UserFile, "STATS", "ELV", 1)
    Call WriteVar(UserFile, "STATS", "ELU", 1000)
    Call WriteVar(UserFile, "STATS", "ELO", 0)
    Call WriteVar(UserFile, "MUERTES", "UserMuertes", 0)
    Call WriteVar(UserFile, "MUERTES", "CrimMuertes", 0)
    Call WriteVar(UserFile, "MUERTES", "NpcsMuertes", 0)

    '[KEVIN]----------------------------------------------------------------------------
    '*******************************************************************************************
    'pluto:7.0 quito esto no hace falta con sistema boveda en cuenta
    'Call WriteVar(userfile, "BancoInventory", "CantidadItems", 0)
    Dim loopd As Integer
    'For loopd = 1 To MAX_BANCOINVENTORY_SLOTS
    '   Call WriteVar(userfile, "BancoInventory", "Obj" & loopd, 0 & "-" & 0)
    'Next loopd
    '*******************************************************************************************
    '[/KEVIN]-----------

    'Save Inv
    Call WriteVar(UserFile, "Inventory", "CantidadItems", 1)
    Call WriteVar(UserFile, "Inventory", "Obj" & 1, 460 & "-" & 1 & "-" & 0)


    For loopc = 2 To MAX_INVENTORY_SLOTS
        Call WriteVar(UserFile, "Inventory", "Obj" & loopc, 0 & "-" & 0)
    Next

    Call WriteVar(UserFile, "Inventory", "WeaponEqpSlot", 1)
    Call WriteVar(UserFile, "Inventory", "ArmourEqpSlot", 0)
    Call WriteVar(UserFile, "Inventory", "CascoEqpSlot", 0)
    Call WriteVar(UserFile, "Inventory", "EscudoEqpSlot", 0)
    Call WriteVar(UserFile, "Inventory", "BarcoSlot", 0)
    Call WriteVar(UserFile, "Inventory", "MunicionSlot", 0)
    'pluto:2.4.1
    Call WriteVar(UserFile, "Inventory", "AnilloEqpSlot", 0)

    '[GAU]
    Call WriteVar(UserFile, "Inventory", "BotaEqpSlot", 0)
    Call WriteVar(UserFile, "Inventory", "AlaEqpSlot", 0)
    '[GAU]

    'Reputacion
    Call WriteVar(UserFile, "REP", "Asesino", 0)
    Call WriteVar(UserFile, "REP", "Bandido", 0)
    Call WriteVar(UserFile, "REP", "Burguesia", 0)
    Call WriteVar(UserFile, "REP", "Ladrones", 0)
    Call WriteVar(UserFile, "REP", "Nobles", 100)
    Call WriteVar(UserFile, "REP", "Plebe", 0)

    Call WriteVar(UserFile, "REP", "Promedio", 100)

    Dim cad As String

    For loopc = 1 To MAXUSERHECHIZOS
        Call WriteVar(UserFile, "HECHIZOS", "H" & loopc, 0)
    Next

    Call WriteVar(UserFile, "MASCOTAS", "NroMascotas", 0)

    For loopc = 1 To 3
        Call WriteVar(UserFile, "MONTURA" & loopc, "NIVEL", 0)
        Call WriteVar(UserFile, "MONTURA" & loopc, "EXP", 0)
        Call WriteVar(UserFile, "MONTURA" & loopc, "ELU", 0)
        Call WriteVar(UserFile, "MONTURA" & loopc, "VIDA", 0)
        Call WriteVar(UserFile, "MONTURA" & loopc, "GOLPE", 0)
        Call WriteVar(UserFile, "MONTURA" & loopc, "NOMBRE", "")
        Call WriteVar(UserFile, "MONTURA" & loopc, "ATCUERPO", 0)
        Call WriteVar(UserFile, "MONTURA" & loopc, "DEFCUERPO", 0)
        Call WriteVar(UserFile, "MONTURA" & loopc, "ATFLECHAS", 0)
        Call WriteVar(UserFile, "MONTURA" & loopc, "DEFFLECHAS", 0)
        Call WriteVar(UserFile, "MONTURA" & loopc, "ATMAGICO", 0)
        Call WriteVar(UserFile, "MONTURA" & loopc, "DEFMAGICO", 0)
        Call WriteVar(UserFile, "MONTURA" & loopc, "EVASION", 0)
        Call WriteVar(UserFile, "MONTURA" & loopc, "LIBRES", 0)
        Call WriteVar(UserFile, "MONTURA" & loopc, "TIPO", 0)

    Next
    Exit Sub

errhandler:
    Call LogError("Error en CreaBebe")

End Sub

