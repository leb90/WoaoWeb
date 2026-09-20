Attribute VB_Name = "ES"
Option Explicit



Public Sub CargarPremiosList()
    Dim p As Integer, loopc As Integer
    p = val(GetVar(App.Path & "\Dat\Premios.dat", "INIT", "NumPremios"))
    'canjeo [Dylan.-]
    ReDim PremiosList(p) As tPremiosCanjes


    For loopc = 1 To p
        PremiosList(loopc).ObjName = GetVar(App.Path & "\Dat\Premios.dat", "PREMIO" & loopc, "Nombre")
        PremiosList(loopc).ObjIndexP = val(GetVar(App.Path & "\Dat\Premios.dat", "PREMIO" & loopc, "NumObj"))
        PremiosList(loopc).ObjRequiere = val(GetVar(App.Path & "\Dat\Premios.dat", "PREMIO" & loopc, "Requiere"))
        PremiosList(loopc).ObjMaxAt = GetVar(App.Path & "\Dat\Premios.dat", "PREMIO" & loopc, "AtaqueMaximo")
        PremiosList(loopc).ObjMinAt = GetVar(App.Path & "\Dat\Premios.dat", "PREMIO" & loopc, "AtaqueMinimo")
        PremiosList(loopc).ObjMindef = GetVar(App.Path & "\Dat\Premios.dat", "PREMIO" & loopc, "DefensaMinima")
        PremiosList(loopc).ObjMaxdef = GetVar(App.Path & "\Dat\Premios.dat", "PREMIO" & loopc, "DefensaMaxima")
        PremiosList(loopc).ObjMinAtMag = GetVar(App.Path & "\Dat\Premios.dat", "PREMIO" & loopc, "AtaqueMagicoMinimo")
        PremiosList(loopc).ObjMaxAtMag = GetVar(App.Path & "\Dat\Premios.dat", "PREMIO" & loopc, "AtaqueMagicoMaximo")
        PremiosList(loopc).ObjMinDefMag = GetVar(App.Path & "\Dat\Premios.dat", "PREMIO" & loopc, "DefensaMagicaMinima")
        PremiosList(loopc).ObjMaxDefMag = GetVar(App.Path & "\Dat\Premios.dat", "PREMIO" & loopc, "DefensaMagicaMaxima")
        PremiosList(loopc).ObjDescripcion = GetVar(App.Path & "\Dat\Premios.dat", "PREMIO" & loopc, "Descripcion")
    Next loopc
End Sub


    Public Sub CargarPremiosListD()
        Dim p As Integer, loopc As Integer
        p = val(GetVar(App.Path & "\Dat\Donaciones.dat", "INIT", "NumPremios"))
   'canjeo [Dylan.-]
        ReDim PremiosListD(p) As tPremiosCanjesD
       
           
        For loopc = 1 To p
            PremiosListD(loopc).ObjName = GetVar(App.Path & "\Dat\Donaciones.dat", "PREMIO" & loopc, "Nombre")
            PremiosListD(loopc).ObjIndexP = val(GetVar(App.Path & "\Dat\Donaciones.dat", "PREMIO" & loopc, "NumObj"))
            PremiosListD(loopc).ObjRequiere = val(GetVar(App.Path & "\Dat\Donaciones.dat", "PREMIO" & loopc, "Requiere"))
            PremiosListD(loopc).ObjMaxAt = GetVar(App.Path & "\Dat\Donaciones.dat", "PREMIO" & loopc, "AtaqueMaximo")
            PremiosListD(loopc).ObjMinAt = GetVar(App.Path & "\Dat\Donaciones.dat", "PREMIO" & loopc, "AtaqueMinimo")
            PremiosListD(loopc).ObjMindef = GetVar(App.Path & "\Dat\Donaciones.dat", "PREMIO" & loopc, "DefensaMinima")
            PremiosListD(loopc).ObjMaxdef = GetVar(App.Path & "\Dat\Donaciones.dat", "PREMIO" & loopc, "DefensaMaxima")
            PremiosListD(loopc).ObjMinAtMag = GetVar(App.Path & "\Dat\Donaciones.dat", "PREMIO" & loopc, "AtaqueMagicoMinimo")
            PremiosListD(loopc).ObjMaxAtMag = GetVar(App.Path & "\Dat\Donaciones.dat", "PREMIO" & loopc, "AtaqueMagicoMaximo")
            PremiosListD(loopc).ObjMinDefMag = GetVar(App.Path & "\Dat\Donaciones.dat", "PREMIO" & loopc, "DefensaMagicaMinima")
            PremiosListD(loopc).ObjMaxDefMag = GetVar(App.Path & "\Dat\Donaciones.dat", "PREMIO" & loopc, "DefensaMagicaMaxima")
            PremiosListD(loopc).ObjDescripcion = GetVar(App.Path & "\Dat\Donaciones.dat", "PREMIO" & loopc, "Descripcion")
            PremiosListD(loopc).ObjFoto = GetVar(App.Path & "\Dat\Donaciones.dat", "PREMIO" & loopc, "Foto")
        Next loopc
    End Sub

Public Sub CargarSpawnList()

    On Error GoTo fallo

    Dim n As Integer, loopc As Integer
    n = val(GetVar(App.Path & "\Dat\Invokar.dat", "INIT", "NumNPCs"))
    ReDim SpawnList(n) As tCriaturasEntrenador

    For loopc = 1 To n
        SpawnList(loopc).NpcIndex = val(GetVar(App.Path & "\Dat\Invokar.dat", "LIST", "NI" & loopc))
        SpawnList(loopc).NpcName = GetVar(App.Path & "\Dat\Invokar.dat", "LIST", "NN" & loopc)
    Next loopc

    Exit Sub
fallo:
    Call LogError("CARGARSPAWNLIST" & Err.number & " D: " & Err.Description)

End Sub

Function EsDios(ByVal Name As String) As Boolean

    On Error GoTo fallo

    Dim NumWizs As Integer
    Dim WizNum As Integer
    NumWizs = val(GetVar(IniPath & "Server.ini", "INIT", "Dioses"))

    For WizNum = 1 To NumWizs

        If UCase$(Name) = UCase$(GetVar(IniPath & "Server.ini", "Dioses", "Dios" & WizNum)) Then
            EsDios = True
            Exit Function

        End If

    Next WizNum

    EsDios = False

    Exit Function
fallo:
    Call LogError("ESDIOS" & Err.number & " D: " & Err.Description)

End Function

Function EsSemiDios(ByVal Name As String) As Boolean

    On Error GoTo fallo

    Dim NumWizs As Integer
    Dim WizNum As Integer
    NumWizs = val(GetVar(IniPath & "Server.ini", "INIT", "SemiDioses"))

    For WizNum = 1 To NumWizs

        If UCase$(Name) = UCase$(GetVar(IniPath & "Server.ini", "SemiDioses", "SemiDios" & WizNum)) Then
            EsSemiDios = True
            Exit Function

        End If

    Next WizNum

    EsSemiDios = False

    Exit Function
fallo:
    Call LogError("ESSEMIDIOS" & Err.number & " D: " & Err.Description)

End Function

Function EsConsejero(ByVal Name As String) As Boolean

    On Error GoTo fallo

    Dim NumWizs As Integer
    Dim WizNum As Integer
    NumWizs = val(GetVar(IniPath & "Server.ini", "INIT", "Consejeros"))

    For WizNum = 1 To NumWizs

        If UCase$(Name) = UCase$(GetVar(IniPath & "Server.ini", "Consejeros", "Consejero" & WizNum)) Then
            EsConsejero = True
            Exit Function

        End If

    Next WizNum

    EsConsejero = False

    Exit Function
fallo:
    Call LogError("ESCONSEJERO" & Err.number & " D: " & Err.Description)

End Function

Public Function TxtDimension(ByVal Name As String) As Long

    On Error GoTo fallo

    Dim n As Integer, cad As String, Tam As Long
    n = FreeFile(1)
    Open Name For Input As #n
    Tam = 0

    Do While Not EOF(n)
        Tam = Tam + 1
        Line Input #n, cad
    Loop
    Close n
    TxtDimension = Tam

    Exit Function
fallo:
    Call LogError("TXTDIMENSION" & Err.number & " D: " & Err.Description)

End Function

Public Sub CargarForbidenWords()

    On Error GoTo fallo

    ReDim ForbidenNames(1 To TxtDimension(DatPath & "NombresInvalidos.txt"))
    Dim n As Integer, i As Integer
    n = FreeFile(1)
    Open DatPath & "NombresInvalidos.txt" For Input As #n

    For i = 1 To UBound(ForbidenNames)
        Line Input #n, ForbidenNames(i)
    Next i

    Close n
    Exit Sub
fallo:
    Call LogError("CAGARFORBIDENWORDS" & Err.number & " D: " & Err.Description)

End Sub

Public Sub CargarHechizos()

    On Error GoTo errhandler

    If frmMain.Visible Then frmMain.txStatus.Caption = "Cargando Hechizos."

    Dim Hechizo As Integer

    'pluto fusión
    Dim leer As New clsIniManager
    leer.Initialize DatPath & "Hechizos.dat"

    'obtiene el numero de hechizos
    NumeroHechizos = val(leer.GetValue("INIT", "NumeroHechizos"))
    'NumeroHechizos = val(GetVar(DatPath & "Hechizos.dat", "INIT", "NumeroHechizos"))
    ReDim Hechizos(1 To NumeroHechizos) As tHechizo

    frmCargando.cargar.min = 0
    frmCargando.cargar.max = NumeroHechizos
    frmCargando.cargar.value = 0

    'Llena la lista
    For Hechizo = 1 To NumeroHechizos
        frmCargando.Label1(2).Caption = "Hechizo: (" & Hechizo & "/" & NumeroHechizos & ")"

        Hechizos(Hechizo).Nombre = leer.GetValue("Hechizo" & Hechizo, "Nombre")
        Hechizos(Hechizo).Desc = leer.GetValue("Hechizo" & Hechizo, "Desc")
        Hechizos(Hechizo).PalabrasMagicas = leer.GetValue("Hechizo" & Hechizo, "PalabrasMagicas")

        Hechizos(Hechizo).HechizeroMsg = leer.GetValue("Hechizo" & Hechizo, "HechizeroMsg")
        Hechizos(Hechizo).TargetMsg = leer.GetValue("Hechizo" & Hechizo, "TargetMsg")
        Hechizos(Hechizo).PropioMsg = leer.GetValue("Hechizo" & Hechizo, "PropioMsg")

        Hechizos(Hechizo).Tipo = val(leer.GetValue("Hechizo" & Hechizo, "Tipo"))
        Hechizos(Hechizo).WAV = val(leer.GetValue("Hechizo" & Hechizo, "WAV"))
        Hechizos(Hechizo).FXgrh = val(leer.GetValue("Hechizo" & Hechizo, "Fxgrh"))

        Hechizos(Hechizo).loops = val(leer.GetValue("Hechizo" & Hechizo, "Loops"))

        Hechizos(Hechizo).Resis = val(leer.GetValue("Hechizo" & Hechizo, "Resis"))

        Hechizos(Hechizo).SubeHP = val(leer.GetValue("Hechizo" & Hechizo, "SubeHP"))
        Hechizos(Hechizo).MinHP = val(leer.GetValue("Hechizo" & Hechizo, "MinHP"))
        Hechizos(Hechizo).MaxHP = val(leer.GetValue("Hechizo" & Hechizo, "MaxHP"))

        Hechizos(Hechizo).SubeMana = val(leer.GetValue("Hechizo" & Hechizo, "SubeMana"))
        Hechizos(Hechizo).MiMana = val(leer.GetValue("Hechizo" & Hechizo, "MinMana"))
        Hechizos(Hechizo).MaMana = val(leer.GetValue("Hechizo" & Hechizo, "MaxMana"))

        Hechizos(Hechizo).SubeSta = val(leer.GetValue("Hechizo" & Hechizo, "SubeSta"))
        Hechizos(Hechizo).MinSta = val(leer.GetValue("Hechizo" & Hechizo, "MinSta"))
        Hechizos(Hechizo).MaxSta = val(leer.GetValue("Hechizo" & Hechizo, "MaxSta"))

        Hechizos(Hechizo).SubeHam = val(leer.GetValue("Hechizo" & Hechizo, "SubeHam"))
        Hechizos(Hechizo).MinHam = val(leer.GetValue("Hechizo" & Hechizo, "MinHam"))
        Hechizos(Hechizo).MaxHam = val(leer.GetValue("Hechizo" & Hechizo, "MaxHam"))

        Hechizos(Hechizo).SubeSed = val(leer.GetValue("Hechizo" & Hechizo, "SubeSed"))
        Hechizos(Hechizo).MinSed = val(leer.GetValue("Hechizo" & Hechizo, "MinSed"))
        Hechizos(Hechizo).MaxSed = val(leer.GetValue("Hechizo" & Hechizo, "MaxSed"))

        Hechizos(Hechizo).SubeAgilidad = val(leer.GetValue("Hechizo" & Hechizo, "SubeAG"))
        Hechizos(Hechizo).MinAgilidad = val(leer.GetValue("Hechizo" & Hechizo, "MinAG"))
        Hechizos(Hechizo).MaxAgilidad = val(leer.GetValue("Hechizo" & Hechizo, "MaxAG"))

        Hechizos(Hechizo).SubeFuerza = val(leer.GetValue("Hechizo" & Hechizo, "SubeFU"))
        Hechizos(Hechizo).MinFuerza = val(leer.GetValue("Hechizo" & Hechizo, "MinFU"))
        Hechizos(Hechizo).MaxFuerza = val(leer.GetValue("Hechizo" & Hechizo, "MaxFU"))

        Hechizos(Hechizo).SubeCarisma = val(leer.GetValue("Hechizo" & Hechizo, "SubeCA"))
        Hechizos(Hechizo).MinCarisma = val(leer.GetValue("Hechizo" & Hechizo, "MinCA"))
        Hechizos(Hechizo).MaxCarisma = val(leer.GetValue("Hechizo" & Hechizo, "MaxCA"))

        Hechizos(Hechizo).Invisibilidad = val(leer.GetValue("Hechizo" & Hechizo, "Invisibilidad"))
        Hechizos(Hechizo).Paraliza = val(leer.GetValue("Hechizo" & Hechizo, "Paraliza"))
        Hechizos(Hechizo).Paralizaarea = val(leer.GetValue("Hechizo" & Hechizo, "Paralizaarea"))

        'Hechizos(Hechizo).Inmoviliza = val(Leer.GetValue("Hechizo" & Hechizo, "Inmoviliza"))
        Hechizos(Hechizo).RemoverParalisis = val(leer.GetValue("Hechizo" & Hechizo, "RemoverParalisis"))
        'Hechizos(Hechizo).RemoverEstupidez = val(Leer.GetValue("Hechizo" & Hechizo, "RemoverEstupidez"))
        Hechizos(Hechizo).RemueveInvisibilidadParcial = val(leer.GetValue("Hechizo" & Hechizo, _
                                                                          "RemueveInvisibilidadParcial"))

        Hechizos(Hechizo).CuraVeneno = val(leer.GetValue("Hechizo" & Hechizo, "CuraVeneno"))
        Hechizos(Hechizo).Envenena = val(leer.GetValue("Hechizo" & Hechizo, "Envenena"))
        'pluto:2.15
        Hechizos(Hechizo).Protec = val(leer.GetValue("Hechizo" & Hechizo, "Protec"))

        Hechizos(Hechizo).Maldicion = val(leer.GetValue("Hechizo" & Hechizo, "Maldicion"))
        Hechizos(Hechizo).RemoverMaldicion = val(leer.GetValue("Hechizo" & Hechizo, "RemoverMaldicion"))
        Hechizos(Hechizo).Bendicion = val(leer.GetValue("Hechizo" & Hechizo, "Bendicion"))
        Hechizos(Hechizo).Revivir = val(leer.GetValue("Hechizo" & Hechizo, "Revivir"))
        Hechizos(Hechizo).Morph = val(leer.GetValue("Hechizo" & Hechizo, "Morph"))

        Hechizos(Hechizo).Ceguera = val(leer.GetValue("Hechizo" & Hechizo, "Ceguera"))
        Hechizos(Hechizo).Estupidez = val(leer.GetValue("Hechizo" & Hechizo, "Estupidez"))

        Hechizos(Hechizo).invoca = val(leer.GetValue("Hechizo" & Hechizo, "Invoca"))
        Hechizos(Hechizo).NumNpc = val(leer.GetValue("Hechizo" & Hechizo, "NumNpc"))
        Hechizos(Hechizo).Cant = val(leer.GetValue("Hechizo" & Hechizo, "Cant"))
        'Hechizos(Hechizo).Mimetiza = val(Leer.GetValue("hechizo" & Hechizo, "Mimetiza"))

        Hechizos(Hechizo).MinNivel = val(leer.GetValue("Hechizo" & Hechizo, "MinNivel"))
        Hechizos(Hechizo).itemIndex = val(leer.GetValue("Hechizo" & Hechizo, "ItemIndex"))

        Hechizos(Hechizo).MinSkill = val(leer.GetValue("Hechizo" & Hechizo, "MinSkill"))
        Hechizos(Hechizo).ManaRequerido = val(leer.GetValue("Hechizo" & Hechizo, "ManaRequerido"))
        Hechizos(Hechizo).Target = val(GetVar(DatPath & "hechizos.dat", "Hechizo" & Hechizo, "Target"))

        frmCargando.cargar.value = frmCargando.cargar.value + 1
        'DoEvents
    Next

    'quitar esto
    Exit Sub

    '------------------------------------------------------------------------------------
    'Esto genera el hechizos.log para meterlo al cliente, el server no usa nada de lo de abajo.
    '------------------------------------------------------------------------------------
    Dim File As String
    Dim n As Byte
    Dim Object As Integer
    File = DatPath & "Hechizos.dat"
    Dim nfile As Integer
    nfile = FreeFile    ' obtenemos un canal
    Open App.Path & "\Hechizo.log" For Append Shared As #nfile

    For Object = 1 To NumeroHechizos
        'Debug.Print Object
        Print #nfile, "hechizos(" & Object & ").nombre=" & Chr(34) & Hechizos(Object).Nombre & Chr(34)
        Print #nfile, "hechizos(" & Object & ").desc=" & Chr(34) & Hechizos(Object).Desc & Chr(34)
        Print #nfile, "hechizos(" & Object & ").palabrasmagicas=" & Chr(34) & Hechizos(Object).PalabrasMagicas & Chr(34)
        Print #nfile, "hechizos(" & Object & ").hechizeromsg=" & Chr(34) & Hechizos(Object).HechizeroMsg & Chr(34)
        Print #nfile, "hechizos(" & Object & ").propiomsg=" & Chr(34) & Hechizos(Object).PropioMsg & Chr(34)
        Print #nfile, "hechizos(" & Object & ").targetmsg=" & Chr(34) & Hechizos(Object).TargetMsg & Chr(34)

        If Hechizos(Object).Bendicion > 0 Then Print #nfile, "hechizos(" & Object & ").bendicion =" & Hechizos( _
                                                             Object).Bendicion

        If Hechizos(Object).Cant > 0 Then Print #nfile, "hechizos(" & Object & ").cant =" & Hechizos(Object).Cant
        If Hechizos(Object).Ceguera > 0 Then Print #nfile, "hechizos(" & Object & ").ceguera =" & Hechizos( _
                                                           Object).Ceguera

        If Hechizos(Object).CuraVeneno > 0 Then Print #nfile, "hechizos(" & Object & ").curaveneno =" & Hechizos( _
                                                              Object).CuraVeneno

        If Hechizos(Object).Envenena > 0 Then Print #nfile, "hechizos(" & Object & ").envenena =" & Hechizos( _
                                                            Object).Envenena

        If Hechizos(Object).Estupidez > 0 Then Print #nfile, "hechizos(" & Object & ").estupidez =" & Hechizos( _
                                                             Object).Estupidez

        If Hechizos(Object).FXgrh > 0 Then Print #nfile, "hechizos(" & Object & ").fxgrh =" & Hechizos(Object).FXgrh
        If Hechizos(Object).Invisibilidad > 0 Then Print #nfile, "hechizos(" & Object & ").invisibilidad =" & _
                                                                 Hechizos(Object).Invisibilidad

        If Hechizos(Object).invoca > 0 Then Print #nfile, "hechizos(" & Object & ").invoca =" & Hechizos(Object).invoca
        If Hechizos(Object).itemIndex > 0 Then Print #nfile, "hechizos(" & Object & ").itemindex =" & Hechizos( _
                                                             Object).itemIndex

        If Hechizos(Object).loops > 0 Then Print #nfile, "hechizos(" & Object & ").loops =" & Hechizos(Object).loops
        If Hechizos(Object).Maldicion > 0 Then Print #nfile, "hechizos(" & Object & ").maldicion  =" & Hechizos( _
                                                             Object).Maldicion

        If Hechizos(Object).MaMana > 0 Then Print #nfile, "hechizos(" & Object & ").mamana=" & Hechizos(Object).MaMana
        If Hechizos(Object).ManaRequerido > 0 Then Print #nfile, "hechizos(" & Object & ").ManaRequerido =" & _
                                                                 Hechizos(Object).ManaRequerido

        If Hechizos(Object).MaxAgilidad > 0 Then Print #nfile, "hechizos(" & Object & ").maxagilidad =" & Hechizos( _
                                                               Object).MaxAgilidad

        If Hechizos(Object).MaxCarisma > 0 Then Print #nfile, "hechizos(" & Object & ").Maxcarisma =" & Hechizos( _
                                                              Object).MaxCarisma

        If Hechizos(Object).MaxFuerza > 0 Then Print #nfile, "hechizos(" & Object & ").Maxfuerza =" & Hechizos( _
                                                             Object).MaxFuerza

        If Hechizos(Object).MaxHam > 0 Then Print #nfile, "hechizos(" & Object & ").maxham =" & Hechizos(Object).MaxHam
        If Hechizos(Object).MaxHP > 0 Then Print #nfile, "hechizos(" & Object & ").Maxhp =" & Hechizos(Object).MaxHP
        If Hechizos(Object).MaxSed > 0 Then Print #nfile, "hechizos(" & Object & ").Maxsed =" & Hechizos(Object).MaxSed
        If Hechizos(Object).MaxSta > 0 Then Print #nfile, "hechizos(" & Object & ").Maxsta =" & Hechizos(Object).MaxSta
        If Hechizos(Object).MiMana > 0 Then Print #nfile, "hechizos(" & Object & ").Mimana =" & Hechizos(Object).MiMana
        If Hechizos(Object).MinAgilidad > 0 Then Print #nfile, "hechizos(" & Object & ").minagilidad =" & Hechizos( _
                                                               Object).MinAgilidad

        If Hechizos(Object).MinCarisma > 0 Then Print #nfile, "hechizos(" & Object & ").mincarisma =" & Hechizos( _
                                                              Object).MinCarisma

        If Hechizos(Object).MinFuerza > 0 Then Print #nfile, "hechizos(" & Object & ").Minfuerza =" & Hechizos( _
                                                             Object).MinFuerza

        If Hechizos(Object).MinHam > 0 Then Print #nfile, "hechizos(" & Object & ").Minham =" & Hechizos(Object).MinHam
        If Hechizos(Object).MinHP > 0 Then Print #nfile, "hechizos(" & Object & ").Minhp =" & Hechizos(Object).MinHP
        If Hechizos(Object).MinSed > 0 Then Print #nfile, "hechizos(" & Object & ").minsed =" & Hechizos(Object).MinSed
        If Hechizos(Object).MinSkill > 0 Then Print #nfile, "hechizos(" & Object & ").minskill =" & Hechizos( _
                                                            Object).MinSkill

        If Hechizos(Object).MinSta > 0 Then Print #nfile, "hechizos(" & Object & ").Minsta =" & Hechizos(Object).MinSta
        If Hechizos(Object).Morph > 0 Then Print #nfile, "hechizos(" & Object & ").morph =" & Hechizos(Object).Morph
        If Hechizos(Object).MinNivel > 0 Then Print #nfile, "hechizos(" & Object & ").MinNivel =" & Hechizos( _
                                                            Object).MinNivel

        If Hechizos(Object).NumNpc > 0 Then Print #nfile, "hechizos(" & Object & ").numnpc =" & Hechizos(Object).NumNpc
        If Hechizos(Object).Paraliza > 0 Then Print #nfile, "hechizos(" & Object & ").paraliza =" & Hechizos( _
                                                            Object).Paraliza

        If Hechizos(Object).Paralizaarea > 0 Then Print #nfile, "hechizos(" & Object & ").paralizaarea =" & Hechizos( _
                                                                Object).Paralizaarea

        If Hechizos(Object).Protec > 0 Then Print #nfile, "hechizos(" & Object & ").protec =" & Hechizos(Object).Protec
        If Hechizos(Object).RemoverMaldicion > 0 Then Print #nfile, "hechizos(" & Object & ").removermaldicion =" & _
                                                                    Hechizos(Object).RemoverMaldicion

        If Hechizos(Object).RemoverParalisis > 0 Then Print #nfile, "hechizos(" & Object & ").removerparalisis =" & _
                                                                    Hechizos(Object).RemoverParalisis

        If Hechizos(Object).Resis > 0 Then Print #nfile, "hechizos(" & Object & ").resis =" & Hechizos(Object).Resis
        If Hechizos(Object).Revivir > 0 Then Print #nfile, "hechizos(" & Object & ").revivir =" & Hechizos( _
                                                           Object).Revivir

        If Hechizos(Object).SubeAgilidad > 0 Then Print #nfile, "hechizos(" & Object & ").subeagilidad =" & Hechizos( _
                                                                Object).SubeAgilidad

        If Hechizos(Object).SubeCarisma > 0 Then Print #nfile, "hechizos(" & Object & ").subecarisma =" & Hechizos( _
                                                               Object).SubeCarisma

        If Hechizos(Object).SubeFuerza > 0 Then Print #nfile, "hechizos(" & Object & ").subefuerza=" & Hechizos( _
                                                              Object).SubeFuerza

        If Hechizos(Object).SubeHam > 0 Then Print #nfile, "hechizos(" & Object & ").subeham =" & Hechizos( _
                                                           Object).SubeHam

        If Hechizos(Object).SubeHP > 0 Then Print #nfile, "hechizos(" & Object & ").subehp =" & Hechizos(Object).SubeHP
        If Hechizos(Object).SubeMana > 0 Then Print #nfile, "hechizos(" & Object & ").subemana =" & Hechizos( _
                                                            Object).SubeMana

        If Hechizos(Object).SubeSed > 0 Then Print #nfile, "hechizos(" & Object & ").subesed =" & Hechizos( _
                                                           Object).SubeSed

        If Hechizos(Object).SubeSta > 0 Then Print #nfile, "hechizos(" & Object & ").subesta =" & Hechizos( _
                                                           Object).SubeSta

        If Hechizos(Object).Target > 0 Then Print #nfile, "hechizos(" & Object & ").target =" & Hechizos(Object).Target
        If Hechizos(Object).Tipo > 0 Then Print #nfile, "hechizos(" & Object & ").tipo =" & Hechizos(Object).Tipo
        If Hechizos(Object).WAV > 0 Then Print #nfile, "hechizos(" & Object & ").wav =" & Hechizos(Object).WAV

    Next
    Close #nfile
    Exit Sub
errhandler:
    MsgBox "Error cargando hechizos.dat"

End Sub

Sub LoadMotd()

    On Error GoTo fallo

    Dim i As Integer
    MaxLines = val(GetVar(App.Path & "\Dat\Motd.ini", "INIT", "NumLines"))
    ReDim MOTD(1 To MaxLines) As String

    For i = 1 To MaxLines
        MOTD(i) = GetVar(App.Path & "\Dat\Motd.ini", "Motd", "Line" & i)
    Next i

    Exit Sub
fallo:
    Call LogError("LOADMOTD" & Err.number & " D: " & Err.Description)

End Sub

Public Sub DoBackUp()

'Call LogTarea("Sub DoBackUp")
    On Error GoTo fallo

    haciendoBK = True
    Call SendData2(ToAll, 0, 0, 19)

    Call SaveGuildsDB
    Call LimpiarMundo
    Call WorldSave

    Call SendData2(ToAll, 0, 0, 19)

    haciendoBK = False

    'Log

    Dim nfile As Integer
    nfile = FreeFile    ' obtenemos un canal
    Open App.Path & "\logs\BackUps.log" For Append Shared As #nfile
    Print #nfile, Date & " " & Time
    Close #nfile

    Exit Sub
fallo:
    Call LogError("DOBACKUP" & Err.number & " D: " & Err.Description)

End Sub

Public Sub grabaPJ()

    On Error GoTo fallo

    Dim Pj As Integer
    Dim Name As String
    haciendoBKPJ = True
    Call SendData(ToAll, 0, 0, "||%%%% POR FAVOR ESPERE, GRABANDO FICHAS DE PJS...%%%%" & "´" & _
                               FontTypeNames.FONTTYPE_INFO)
    Call SendData2(ToAll, 0, 0, 19)

    For Pj = 1 To LastUser
        Call SaveUser(Pj, CharPath & Left$(UCase$(UserList(Pj).Name), 1) & "\" & UCase$(UserList(Pj).Name) & ".chr")
    Next Pj

    Call SendData2(ToAll, 0, 0, 19)
    Call SendData(ToAll, 0, 0, "||%%%% FICHAS GRABADAS, PUEDEN CONTINUAR.GRACIAS. %%%%" & "´" & _
                               FontTypeNames.FONTTYPE_INFO)

    haciendoBKPJ = False

    'Log

    Dim nfile As Integer
    nfile = FreeFile    ' obtenemos un canal
    Open App.Path & "\logs\BackupPJ.log" For Append Shared As #nfile
    Print #nfile, Date & " " & Time
    Close #nfile

    Exit Sub
fallo:
    Call LogError("GRABAPJ" & Err.number & " D: " & Err.Description)

End Sub


Sub LoadArmasHerreria()

    On Error GoTo fallo

    Dim n As Integer, LC As Integer

    n = val(GetVar(DatPath & "ArmasHerrero.dat", "INIT", "NumArmas"))

    ReDim Preserve ArmasHerrero(1 To n) As Integer

    For LC = 1 To n
        ArmasHerrero(LC) = val(GetVar(DatPath & "ArmasHerrero.dat", "Arma" & LC, "Index"))
        'pluto:6.0a
        ObjData(ArmasHerrero(LC)).ParaHerre = 1
    Next LC

    Exit Sub
fallo:
    Call LogError("LOADARMASHERRERIA" & Err.number & " D: " & Err.Description)

End Sub

Sub LoadArmadurasHerreria()

    On Error GoTo fallo

    Dim n As Integer, LC As Integer

    n = val(GetVar(DatPath & "ArmadurasHerrero.dat", "INIT", "NumArmaduras"))

    ReDim Preserve ArmadurasHerrero(1 To n) As Integer

    For LC = 1 To n
        ArmadurasHerrero(LC) = val(GetVar(DatPath & "ArmadurasHerrero.dat", "Armadura" & LC, "Index"))
        'pluto:6.0a
        ObjData(ArmadurasHerrero(LC)).ParaHerre = 1
    Next LC

    Exit Sub
fallo:
    Call LogError("LOADARMADURASHERRERIA" & Err.number & " D: " & Err.Description)

End Sub

Sub LoadPorcentajesMascotas()

    PMascotas(1).Tipo = "Unicornio"
    PMascotas(2).Tipo = "Caballo Negro"
    PMascotas(3).Tipo = "Tigre"
    PMascotas(4).Tipo = "Elefante"
    PMascotas(5).Tipo = "Dragón"
    PMascotas(6).Tipo = "Jabato"
    PMascotas(7).Tipo = "Kong"
    PMascotas(8).Tipo = "Hipogrifo"
    PMascotas(9).Tipo = "Rinosaurio"
    PMascotas(10).Tipo = "Cerbero"
    PMascotas(11).Tipo = "Wyvern"
    PMascotas(12).Tipo = "Avestruz"

    'unicornio
    PMascotas(1).AumentoMagia = 15
    PMascotas(1).ReduceMagia = 9
    PMascotas(1).AumentoEvasion = 6
    PMascotas(1).VidaporLevel = 35
    PMascotas(1).GolpeporLevel = 13
    PMascotas(1).TopeAtMagico = 15
    PMascotas(1).TopeDefMagico = 9
    PMascotas(1).TopeEvasion = 6
    'negro
    PMascotas(2).AumentoMagia = 15
    PMascotas(2).ReduceMagia = 3
    PMascotas(2).AumentoEvasion = 1
    PMascotas(2).VidaporLevel = 30
    PMascotas(2).GolpeporLevel = 13
    PMascotas(2).TopeAtMagico = 9
    PMascotas(2).TopeDefMagico = 15
    PMascotas(2).TopeEvasion = 6
    'tigre
    PMascotas(3).ReduceCuerpo = 2
    PMascotas(3).AumentoEvasion = 6
    PMascotas(3).AumentoFlecha = 4
    PMascotas(3).VidaporLevel = 35
    PMascotas(3).GolpeporLevel = 13
    PMascotas(3).TopeAtFlechas = 9
    PMascotas(3).TopeDefMagico = 9
    PMascotas(3).TopeEvasion = 12
    'elefante
    PMascotas(4).AumentoCuerpo = 6
    PMascotas(4).ReduceCuerpo = 1
    PMascotas(4).ReduceFlecha = 1
    PMascotas(4).VidaporLevel = 50
    PMascotas(4).GolpeporLevel = 13
    PMascotas(4).TopeAtCuerpo = 15
    PMascotas(4).TopeDefCuerpo = 9
    PMascotas(4).TopeEvasion = 6
    'dragon
    PMascotas(5).AumentoCuerpo = 6
    PMascotas(5).ReduceCuerpo = 6
    PMascotas(5).AumentoMagia = 6
    PMascotas(5).ReduceMagia = 6
    PMascotas(5).AumentoFlecha = 6
    PMascotas(5).ReduceFlecha = 6
    PMascotas(5).AumentoEvasion = 6
    PMascotas(5).VidaporLevel = 80
    PMascotas(5).GolpeporLevel = 28
    PMascotas(5).TopeAtMagico = 9
    PMascotas(5).TopeDefMagico = 9
    PMascotas(5).TopeEvasion = 9
    PMascotas(5).TopeAtCuerpo = 9
    PMascotas(5).TopeDefCuerpo = 9
    PMascotas(5).TopeAtFlechas = 9
    PMascotas(5).TopeDefFlechas = 9
    'jabalí pequeño
    PMascotas(6).AumentoCuerpo = 1
    PMascotas(6).ReduceCuerpo = 6
    PMascotas(6).ReduceFlecha = 0
    PMascotas(6).VidaporLevel = 7
    PMascotas(6).GolpeporLevel = 13
    PMascotas(6).TopeAtMagico = 16
    PMascotas(6).TopeDefMagico = 16
    PMascotas(6).TopeEvasion = 16
    PMascotas(6).TopeAtCuerpo = 16
    PMascotas(6).TopeDefCuerpo = 16
    PMascotas(6).TopeAtFlechas = 16
    PMascotas(6).TopeDefFlechas = 16
    'kong
    PMascotas(7).AumentoCuerpo = 6
    PMascotas(7).ReduceCuerpo = 6
    PMascotas(7).AumentoMagia = 6
    PMascotas(7).ReduceMagia = 6
    PMascotas(7).AumentoFlecha = 6
    PMascotas(7).ReduceFlecha = 6
    PMascotas(7).AumentoEvasion = 6
    PMascotas(7).VidaporLevel = 80
    PMascotas(7).GolpeporLevel = 35
    PMascotas(7).TopeAtMagico = 9
    PMascotas(7).TopeDefMagico = 9
    PMascotas(7).TopeEvasion = 9
    PMascotas(7).TopeAtCuerpo = 9
    PMascotas(7).TopeDefCuerpo = 9
    PMascotas(7).TopeAtFlechas = 9
    PMascotas(7).TopeDefFlechas = 9
    'Crom
    PMascotas(8).AumentoCuerpo = 6
    PMascotas(8).ReduceCuerpo = 6
    PMascotas(8).AumentoMagia = 6
    PMascotas(8).ReduceMagia = 6
    PMascotas(8).AumentoFlecha = 6
    PMascotas(8).ReduceFlecha = 6
    PMascotas(8).AumentoEvasion = 6
    PMascotas(8).VidaporLevel = 80
    PMascotas(8).GolpeporLevel = 35
    PMascotas(8).TopeAtMagico = 9
    PMascotas(8).TopeDefMagico = 9
    PMascotas(8).TopeEvasion = 9
    PMascotas(8).TopeAtCuerpo = 9
    PMascotas(8).TopeDefCuerpo = 9
    PMascotas(8).TopeAtFlechas = 9
    PMascotas(8).TopeDefFlechas = 9
    'rinosaurio
    PMascotas(9).AumentoCuerpo = 6
    PMascotas(9).ReduceCuerpo = 6
    PMascotas(9).ReduceFlecha = 1
    PMascotas(9).VidaporLevel = 55
    PMascotas(9).GolpeporLevel = 13
    PMascotas(9).TopeEvasion = 9
    PMascotas(9).TopeDefMagico = 15
    PMascotas(9).TopeAtCuerpo = 6
    'cerbero
    PMascotas(10).ReduceCuerpo = 6
    PMascotas(10).AumentoEvasion = 2
    PMascotas(10).AumentoFlecha = 6
    PMascotas(10).VidaporLevel = 45
    PMascotas(10).GolpeporLevel = 13
    PMascotas(10).TopeAtFlechas = 6
    PMascotas(10).TopeDefMagico = 12
    PMascotas(10).TopeDefCuerpo = 12
    'wyvern
    PMascotas(11).AumentoMagia = 6
    PMascotas(11).ReduceMagia = 4
    PMascotas(11).AumentoEvasion = 3
    PMascotas(11).VidaporLevel = 40
    PMascotas(11).GolpeporLevel = 13
    PMascotas(11).TopeDefFlechas = 9
    PMascotas(11).TopeAtMagico = 12
    PMascotas(11).TopeDefMagico = 9
    'avestruz
    PMascotas(12).ReduceCuerpo = 1
    PMascotas(12).AumentoEvasion = 2
    PMascotas(12).AumentoFlecha = 6
    PMascotas(12).VidaporLevel = 35
    PMascotas(12).GolpeporLevel = 13
    PMascotas(12).TopeAtFlechas = 15
    PMascotas(12).TopeDefFlechas = 9
    PMascotas(12).TopeEvasion = 6
    'tope niveles
    PMascotas(1).TopeLevel = 30
    PMascotas(2).TopeLevel = 30
    PMascotas(3).TopeLevel = 30
    PMascotas(4).TopeLevel = 30
    PMascotas(5).TopeLevel = 16
    PMascotas(6).TopeLevel = 16
    PMascotas(7).TopeLevel = 17
    PMascotas(8).TopeLevel = 17
    PMascotas(9).TopeLevel = 30
    PMascotas(10).TopeLevel = 30
    PMascotas(11).TopeLevel = 30
    PMascotas(12).TopeLevel = 30

    'pluto:6.0A cargamos exp mascotas
    Dim n As Byte
    Dim nn As Byte
    Dim aa As Integer
    Dim bb As Long
    Dim cc As Long

    For n = 1 To 30
        aa = aa + 400
        bb = bb + 1800
        cc = cc + 20

        For nn = 1 To 12

            If nn = 5 Or nn = 7 Or nn = 8 Then
                PMascotas(nn).exp(n) = PMascotas(nn).exp(n) + bb
            ElseIf nn = 6 Then
                PMascotas(nn).exp(n) = PMascotas(nn).exp(n) + cc
            Else
                PMascotas(nn).exp(n) = PMascotas(nn).exp(n) + aa

            End If

        Next nn
    Next n

End Sub

Sub LoadObjCarpintero()

    On Error GoTo fallo

    Dim n As Integer, LC As Integer

    n = val(GetVar(DatPath & "ObjCarpintero.dat", "INIT", "NumObjs"))

    ReDim Preserve ObjCarpintero(1 To n) As Integer

    For LC = 1 To n
        ObjCarpintero(LC) = val(GetVar(DatPath & "ObjCarpintero.dat", "Obj" & LC, "Index"))
        'pluto:6.0a
        ObjData(ObjCarpintero(LC)).ParaCarpin = 1
    Next LC

    Exit Sub
fallo:
    Call LogError("LOADOBJCARPINTERO" & Err.number & " D: " & Err.Description)

End Sub

'[MerLiNz:6]
Sub LoadObjMagicosermitano()

    On Error GoTo fallo

    Dim n As Integer, LC As Integer

    n = val(GetVar(DatPath & "Objermitano.dat", "INIT", "NumObjs"))

    ReDim Preserve Objermitano(1 To n) As Integer

    For LC = 1 To n
        Objermitano(LC) = val(GetVar(DatPath & "Objermitano.dat", "Obj" & LC, "Index"))
        'pluto:6.0a
        ObjData(Objermitano(LC)).ParaErmi = 1
    Next LC

    Exit Sub
fallo:
    Call LogError("LOADOBJMAGICOERMITAÑO" & Err.number & " D: " & Err.Description)

    '[\END]
End Sub

'Pluto:hoy
Sub Loadtrivial()

    On Error GoTo perro

    Dim n As Integer
    Dim numtrivial As Integer
    Dim leer As New clsIniManager
    Dim obj As ObjData

    leer.Initialize DatPath & "Trivial.txt"

    'numtrivial = val(GetVar(DatPath & "Trivial.txt", "INIT", "NumTrivial"))
    numtrivial = val(leer.GetValue("INIT", "NumTrivial"))

    n = RandomNumber(1, numtrivial)
    'PreTrivial = GetVar(DatPath & "TRIVIAL.TXT", "T" & n, "tx")
    PreTrivial = leer.GetValue("T" & n, "tx")

    'ResTrivial = GetVar(DatPath & "TRIVIAL.TXT", "T" & n, "RES")
    ResTrivial = leer.GetValue("T" & n, "RES")

    Exit Sub

perro:
    LogError ("Trivial: Error en la pregunta numero: " & n & " : " & Err.Description)

End Sub

'Pluto:2.4
Sub Loadrecord()

    On Error GoTo perro

    NivCrimi = val(GetVar(IniPath & "RECORD.TXT", "INIT", "NivCrimi"))
    NivCiu = val(GetVar(IniPath & "RECORD.TXT", "INIT", "NivCiu"))
    MaxTorneo = val(GetVar(IniPath & "RECORD.TXT", "INIT", "MaxTorneo"))
    Moro = val(GetVar(IniPath & "RECORD.TXT", "INIT", "Moro"))
    NNivCrimi = GetVar(IniPath & "RECORD.TXT", "INIT", "NNivCrimi")
    NNivCiu = GetVar(IniPath & "RECORD.TXT", "INIT", "NNivCiu")
    NMaxTorneo = GetVar(IniPath & "RECORD.TXT", "INIT", "NMaxTorneo")
    NMoro = GetVar(IniPath & "RECORD.TXT", "INIT", "NMoro")
    'pluto:6.9
    'Clan1Torneo = GetVar(IniPath & "RECORD.TXT", "INIT", "Clan1Torneo")
    'Clan2Torneo = GetVar(IniPath & "RECORD.TXT", "INIT", "Clan2Torneo")
    'PClan1Torneo = val(GetVar(IniPath & "RECORD.TXT", "INIT", "PClan1Torneo"))
    'PClan2Torneo = val(GetVar(IniPath & "RECORD.TXT", "INIT", "PClan2Torneo"))
    Exit Sub
perro:
    LogError ("Records: Error en cargando Records: " & Err.Description)

End Sub

'Pluto:hoy
Sub LoadEgipto()

    On Error GoTo perro

    Dim n As Integer
    Dim numegipto As Integer
    numegipto = val(GetVar(DatPath & "egipto.txt", "INIT", "NumEgipto"))
    n = RandomNumber(1, numegipto)
    PreEgipto = GetVar(DatPath & "EGIPTO.TXT", "T" & n, "tx")
    ResEgipto = GetVar(DatPath & "EGIPTO.TXT", "T" & n, "RES")
    Exit Sub
perro:
    LogError ("Egipto: Error en la pregunta numero: " & n & " : " & Err.Description)

End Sub

Sub LoadOBJData()

    On Error GoTo errhandler

    If frmMain.Visible Then frmMain.txStatus.Caption = "Cargando base de datos de los objetos."

    '*****************************************************************
    'Carga la lista de objetos
    '*****************************************************************
    Dim Object As Long
    'pluto fusion
    Dim leer   As New clsIniManager
    leer.Initialize DatPath & "Obj.dat"

    'obtiene el numero de obj
    NumObjDatas = val(leer.GetValue("INIT", "NumObjs"))

    frmCargando.cargar.min = 0
    frmCargando.cargar.max = NumObjDatas
    frmCargando.cargar.value = 0

    ReDim Preserve ObjData(1 To NumObjDatas) As ObjData
    Dim Calcu As Double

    'Llena la lista
    For Object = 1 To NumObjDatas
        Calcu = Object
        Calcu = Calcu * 100
        Calcu = Calcu / NumObjDatas
        frmCargando.Label1(2).Caption = "Objeto: (" & Object & "/" & NumObjDatas & ") " & Round(Calcu, 1) & "%"

        With ObjData(Object)

            .Name = leer.GetValue("OBJ" & Object, "Name")
            '.Name = Leer.GetValue("OBJ" & Object, "Name")
            'pluto 2.17
            .Magia = val(leer.GetValue("OBJ" & Object, "Magia"))

            'pluto:2.8.0
            .Vendible = val(leer.GetValue("OBJ" & Object, "Vendible"))
            .GrhIndex = val(leer.GetValue("OBJ" & Object, "GrhIndex"))

            .OBJType = val(leer.GetValue("OBJ" & Object, "ObjType"))
            .SubTipo = val(leer.GetValue("OBJ" & Object, "Subtipo"))
            'pluto:6.0A
            .ArmaNpc = val(leer.GetValue("OBJ" & Object, "ArmaNpc"))
            .Newbie = val(leer.GetValue("OBJ" & Object, "Newbie"))

            'pluto:2.3
            .Peso = 0    ' val(Leer.GetValue("OBJ" & Object, "Peso"))

            If .SubTipo = OBJTYPE_ESCUDO Then
                .ShieldAnim = val(leer.GetValue("OBJ" & Object, "Anim"))
                .LingH = val(leer.GetValue("OBJ" & Object, "LingH"))
                .LingP = val(leer.GetValue("OBJ" & Object, "LingP"))
                .LingO = val(leer.GetValue("OBJ" & Object, "LingO"))
                .SkHerreria = val(leer.GetValue("OBJ" & Object, "SkHerreria"))  ' * 2
                '[MerLiNz:6]
                .Gemas = val(leer.GetValue("OBJ" & Object, "Gemas"))
                .Diamantes = val(leer.GetValue("OBJ" & Object, "Diamantes"))

                '[\END]
            End If

            'pluto:6.2----------
            If .OBJType = OBJTYPE_Anillo Then
                .LingH = val(leer.GetValue("OBJ" & Object, "LingH"))
                .LingP = val(leer.GetValue("OBJ" & Object, "LingP"))
                .LingO = val(leer.GetValue("OBJ" & Object, "LingO"))
                .SkHerreria = val(leer.GetValue("OBJ" & Object, "SkHerreria"))  ' * 2
                .Gemas = val(leer.GetValue("OBJ" & Object, "Gemas"))
                .Diamantes = val(leer.GetValue("OBJ" & Object, "Diamantes"))

            End If

            '--------------------

            If .SubTipo = OBJTYPE_CASCO Then

                .CascoAnim = val(leer.GetValue("OBJ" & Object, "Anim"))
                .LingH = val(leer.GetValue("OBJ" & Object, "LingH"))
                .LingP = val(leer.GetValue("OBJ" & Object, "LingP"))
                .LingO = val(leer.GetValue("OBJ" & Object, "LingO"))
                '[MerLiNz:6]
                .Gemas = val(leer.GetValue("OBJ" & Object, "Gemas"))
                .Diamantes = val(leer.GetValue("OBJ" & Object, "Diamantes"))
                '[\END]
                .SkHerreria = val(leer.GetValue("OBJ" & Object, "SkHerreria"))  '* 2

            End If

            If .SubTipo = OBJTYPE_ALAS Then
                .AlasAnim = val(leer.GetValue("OBJ" & Object, "Anim"))
                .LingH = val(leer.GetValue("OBJ" & Object, "LingH"))
                .LingP = val(leer.GetValue("OBJ" & Object, "LingP"))
                .LingO = val(leer.GetValue("OBJ" & Object, "LingO"))
                '[MerLiNz:6]
                .Gemas = val(leer.GetValue("OBJ" & Object, "Gemas"))
                .Diamantes = val(leer.GetValue("OBJ" & Object, "Diamantes"))
                '[\END]
                .SkHerreria = val(leer.GetValue("OBJ" & Object, "SkHerreria"))  '* 2

            End If

            '[GAU]
            If .SubTipo = OBJTYPE_BOTA Then
                .Botas = val(leer.GetValue("OBJ" & Object, "Anim"))
                .LingH = val(leer.GetValue("OBJ" & Object, "LingH"))
                .LingP = val(leer.GetValue("OBJ" & Object, "LingP"))
                .LingO = val(leer.GetValue("OBJ" & Object, "LingO"))
                .SkHerreria = val(leer.GetValue("OBJ" & Object, "SkHerreria"))  ' * 2

            End If

            '[GAU]
            .Ropaje = val(leer.GetValue("OBJ" & Object, "NumRopaje"))
            .HechizoIndex = val(leer.GetValue("OBJ" & Object, "HechizoIndex"))

            If .OBJType = OBJTYPE_WEAPON Then
                .WeaponAnim = val(leer.GetValue("OBJ" & Object, "Anim"))
                .Apuñala = val(leer.GetValue("OBJ" & Object, "Apuñala"))
                .Envenena = val(leer.GetValue("OBJ" & Object, "Envenena"))
                .MaxHIT = val(leer.GetValue("OBJ" & Object, "MaxHIT"))
                .MinHIT = val(leer.GetValue("OBJ" & Object, "MinHIT"))
                .LingH = val(leer.GetValue("OBJ" & Object, "LingH"))
                .LingP = val(leer.GetValue("OBJ" & Object, "LingP"))
                .LingO = val(leer.GetValue("OBJ" & Object, "LingO"))
                .SkHerreria = val(leer.GetValue("OBJ" & Object, "SkHerreria"))  ' * 2
                .Real = val(leer.GetValue("OBJ" & Object, "Real"))
                .Caos = val(leer.GetValue("OBJ" & Object, "Caos"))
                .proyectil = val(leer.GetValue("OBJ" & Object, "Proyectil"))
                .Municion = val(leer.GetValue("OBJ" & Object, "Municiones"))
                '[MerLiNz:6]
                .Gemas = val(leer.GetValue("OBJ" & Object, "Gemas"))
                .Diamantes = val(leer.GetValue("OBJ" & Object, "Diamantes"))
                '[\END]
                .SkArma = val(leer.GetValue("OBJ" & Object, "SKARMA"))
                .SkArco = val(leer.GetValue("OBJ" & Object, "SKARCO"))

            End If

            If .OBJType = OBJTYPE_ARMOUR Then
                .LingH = val(leer.GetValue("OBJ" & Object, "LingH"))
                .LingP = val(leer.GetValue("OBJ" & Object, "LingP"))
                .LingO = val(leer.GetValue("OBJ" & Object, "LingO"))
                .SkHerreria = val(leer.GetValue("OBJ" & Object, "SkHerreria"))  ' * 2
                .Real = val(leer.GetValue("OBJ" & Object, "Real"))
                .Caos = val(leer.GetValue("OBJ" & Object, "Caos"))
                '[MerLiNz:6]
                .Gemas = val(leer.GetValue("OBJ" & Object, "Gemas"))
                .Diamantes = val(leer.GetValue("OBJ" & Object, "Diamantes"))
                'pluto:2.10
                .ObjetoClan = leer.GetValue("OBJ" & Object, "ObjetoClan")

                '[\END]
            End If

            If .OBJType = OBJTYPE_HERRAMIENTAS Then
                .LingH = val(leer.GetValue("OBJ" & Object, "LingH"))
                .LingP = val(leer.GetValue("OBJ" & Object, "LingP"))
                .LingO = val(leer.GetValue("OBJ" & Object, "LingO"))
                .SkHerreria = val(leer.GetValue("OBJ" & Object, "SkHerreria"))  '* 2
                '[MerLiNz:6]
                .Gemas = val(leer.GetValue("OBJ" & Object, "Gemas"))
                .Diamantes = val(leer.GetValue("OBJ" & Object, "Diamantes"))

                '[\END]
            End If

            If .OBJType = OBJTYPE_INSTRUMENTOS Then
                .Snd1 = val(leer.GetValue("OBJ" & Object, "SND1"))
                .Snd2 = val(leer.GetValue("OBJ" & Object, "SND2"))
                .Snd3 = val(leer.GetValue("OBJ" & Object, "SND3"))
                .MinInt = val(leer.GetValue("OBJ" & Object, "MinInt"))

            End If

            .LingoteIndex = val(leer.GetValue("OBJ" & Object, "LingoteIndex"))

            If .OBJType = 31 Or .OBJType = 23 Then
                .MinSkill = val(leer.GetValue("OBJ" & Object, "MinSkill"))

            End If

            .MineralIndex = val(leer.GetValue("OBJ" & Object, "MineralIndex"))

            .MaxHP = val(leer.GetValue("OBJ" & Object, "MaxHP"))
            .MinHP = val(leer.GetValue("OBJ" & Object, "MinHP"))

            .Mujer = val(leer.GetValue("OBJ" & Object, "Mujer"))
            .Hombre = val(leer.GetValue("OBJ" & Object, "Hombre"))

            .MinHam = val(leer.GetValue("OBJ" & Object, "MinHam"))
            .MinSed = val(leer.GetValue("OBJ" & Object, "MinAgu"))

            'pluto:7.0
            .MinDef = val(leer.GetValue("OBJ" & Object, "MINDEF"))
            .MaxDef = val(leer.GetValue("OBJ" & Object, "MAXDEF"))
            .Defmagica = val(leer.GetValue("OBJ" & Object, "DEFMAGICA"))
            'nati:agrego DefCuerpo
            .Defcuerpo = val(leer.GetValue("OBJ" & Object, "DEFCUERPO"))
            .Drop = val(leer.GetValue("OBJ" & Object, "DROP"))

            '.Defproyectil = val(Leer.GetValue("OBJ" & Object, "DEFPROYECTIL"))

            .Respawn = val(leer.GetValue("OBJ" & Object, "ReSpawn"))

            .RazaEnana = val(leer.GetValue("OBJ" & Object, "RazaEnana"))
            .razaelfa = val(leer.GetValue("OBJ" & Object, "RazaElfa"))
            .razavampiro = val(leer.GetValue("OBJ" & Object, "Razavampiro"))
            .razaorca = val(leer.GetValue("OBJ" & Object, "Razaorca"))
            .razahumana = val(leer.GetValue("OBJ" & Object, "Razahumana"))

            .Valor = val(leer.GetValue("OBJ" & Object, "Valor"))
            .nocaer = val(leer.GetValue("OBJ" & Object, "nocaer"))
            .objetoespecial = val(leer.GetValue("OBJ" & Object, "objetoespecial"))

            .Crucial = val(leer.GetValue("OBJ" & Object, "Crucial"))

            .Cerrada = val(leer.GetValue("OBJ" & Object, "abierta"))

            If .Cerrada = 1 Then
                .Llave = val(leer.GetValue("OBJ" & Object, "Llave"))
                .Clave = val(leer.GetValue("OBJ" & Object, "Clave"))

            End If

            If .OBJType = OBJTYPE_PUERTAS Or .OBJType = OBJTYPE_BOTELLAVACIA Or ObjData(Object).OBJType = OBJTYPE_BOTELLALLENA Then
                .IndexAbierta = val(leer.GetValue("OBJ" & Object, "IndexAbierta"))
                .IndexCerrada = val(leer.GetValue("OBJ" & Object, "IndexCerrada"))
                .IndexCerradaLlave = val(leer.GetValue("OBJ" & Object, "IndexCerradaLlave"))

            End If

            'Puertas y llaves
            .Clave = val(leer.GetValue("OBJ" & Object, "Clave"))

            .Texto = leer.GetValue("OBJ" & Object, "Texto")
            .GrhSecundario = val(leer.GetValue("OBJ" & Object, "VGrande"))

            .Agarrable = val(leer.GetValue("OBJ" & Object, "Agarrable"))
            .ForoID = leer.GetValue("OBJ" & Object, "ID")

            Dim i As Integer, tStr As String

            For i = 1 To NUMCLASES

                tStr = leer.GetValue("OBJ" & Object, "CP" & i)

                If tStr <> "" Then
                    tStr = mid$(tStr, 1, Len(tStr) - 1)
                    tStr = Right$(tStr, Len(tStr) - 1)

                End If

                .ClaseProhibida(i) = tStr
            Next

            .Resistencia = val(leer.GetValue("OBJ" & Object, "Resistencia"))

            'Pociones
            If .OBJType = 11 Then
                .TipoPocion = val(leer.GetValue("OBJ" & Object, "TipoPocion"))
                .MaxModificador = val(leer.GetValue("OBJ" & Object, "MaxModificador"))
                .MinModificador = val(leer.GetValue("OBJ" & Object, "MinModificador"))
                .DuracionEfecto = val(leer.GetValue("OBJ" & Object, "DuracionEfecto"))

            End If

            .SkCarpinteria = val(leer.GetValue("OBJ" & Object, "SkCarpinteria"))  '* 2

            If .SkCarpinteria > 0 Then .Madera = val(leer.GetValue("OBJ" & Object, "Madera"))

            If .OBJType = OBJTYPE_BARCOS Then
                .MaxHIT = val(leer.GetValue("OBJ" & Object, "MaxHIT"))
                .MinHIT = val(leer.GetValue("OBJ" & Object, "MinHIT"))

            End If

            If .OBJType = OBJTYPE_FLECHAS Then
                .MaxHIT = val(leer.GetValue("OBJ" & Object, "MaxHIT"))
                .MinHIT = val(leer.GetValue("OBJ" & Object, "MinHIT"))

            End If
        
            If .OBJType = OBJTYPE_HUEVOS Then
                .Doma = val(leer.GetValue("OBJ" & Object, "Doma"))

            End If

            'Bebidas
            .MinSta = val(leer.GetValue("OBJ" & Object, "MinST"))
            .razavampiro = val(leer.GetValue("OBJ" & Object, "razavampiro"))
            'pluto:6.0A----
            .Cregalos = val(leer.GetValue("OBJ" & Object, "Cregalos"))
            .Pregalo = val(leer.GetValue("OBJ" & Object, "Pregalo"))
            '--------------
            frmCargando.cargar.value = frmCargando.cargar.value + 1

            'pluto:6.0A
            If .Pregalo > 0 Then

                Select Case .Pregalo

                    Case 1
                        Reo1 = Reo1 + 1
                        ObjRegalo1(Reo1) = Object

                    Case 2
                        Reo2 = Reo2 + 1
                        ObjRegalo2(Reo2) = Object

                    Case 3
                        Reo3 = Reo3 + 1
                        ObjRegalo3(Reo3) = Object

                End Select

            End If

        End With

    Next Object

    'quitar esto
    Exit Sub
    '------------------------------------------------------------------------------------
    'Esto genera el obj.log para meterlo al cliente, el server no usa nada de lo de abajo.
    '------------------------------------------------------------------------------------
    Dim File As String
    Dim n    As Byte
    File = DatPath & "Obj.dat"
    Dim nfile As Integer
    Dim vec   As Byte
    Dim vec2  As Integer
    vec = 1
    nfile = FreeFile    ' obtenemos un canal
    Open App.Path & "\Objeto.log" For Append Shared As #nfile
    Print #nfile, "Sub CargamosObjetos" & vec & "()"

    For Object = 1 To NumObjDatas

        With ObjData(Object)
     
            vec2 = vec2 + 1
            'Debug.Print Object

            If vec2 > 100 Then
                vec = vec + 1
                vec2 = 0
                Print #nfile, "end sub"
                Print #nfile, "sub CargamosObjetos" & vec & "()"

            End If

            Print #nfile, "ObjData(" & Object & ").name=" & Chr(34) & .Name & Chr(34)

            If .Agarrable > 0 Then Print #nfile, "ObjData(" & Object & ").agarrable =" & ObjData(Object).Agarrable

            If .Apuñala > 0 Then Print #nfile, "ObjData(" & Object & ").apuñala=" & .Apuñala

            If .ArmaNpc > 0 Then Print #nfile, "ObjData(" & Object & ").armanpc=" & .ArmaNpc

            If .Botas > 0 Then Print #nfile, "ObjData(" & Object & ").botas=" & .Botas

            If .AlasAnim > 0 Then Print #nfile, "ObjData(" & Object & ").alasanim=" & ObjData(Object).AlasAnim

            If .Caos > 0 Then Print #nfile, "ObjData(" & Object & ").caos=" & .Caos

            If .CascoAnim > 0 Then Print #nfile, "ObjData(" & Object & ").cascoanim=" & ObjData(Object).CascoAnim

            If .Cerrada > 0 Then Print #nfile, "ObjData(" & Object & ").cerrada=" & .Cerrada

            For n = 1 To 21

                If .ClaseProhibida(n) <> "" Then Print #nfile, "ObjData(" & Object & ").claseprohibida(" & n & ")=" & Chr(34) & .ClaseProhibida(n) & Chr(34)
            Next

            If .Clave > 0 Then Print #nfile, "ObjData(" & Object & ").clave=" & .Clave

            If .Crucial > 0 Then Print #nfile, "ObjData(" & Object & ").crucial=" & .Crucial

            If .Def > 0 Then Print #nfile, "ObjData(" & Object & ").def=" & .Def

            If .Diamantes > 0 Then Print #nfile, "ObjData(" & Object & ").diamantes=" & ObjData(Object).Diamantes

            If .DuracionEfecto > 0 Then Print #nfile, "ObjData(" & Object & ").duracionefecto=" & ObjData(Object).DuracionEfecto

            If .Envenena > 0 Then Print #nfile, "ObjData(" & Object & ").envenena=" & ObjData(Object).Envenena

            If .ForoID <> "" Then Print #nfile, "ObjData(" & Object & ").foroid=" & Chr(34) & ObjData(Object).ForoID & Chr(34)

            If .Gemas > 0 Then Print #nfile, "ObjData(" & Object & ").gemas=" & .Gemas

            If .GrhIndex > 0 Then Print #nfile, "ObjData(" & Object & ").grhindex=" & ObjData(Object).GrhIndex

            If .GrhSecundario > 0 Then Print #nfile, "ObjData(" & Object & ").grhsecundario=" & ObjData(Object).GrhSecundario

            If .HechizoIndex > 0 Then Print #nfile, "ObjData(" & Object & ").hechizoindex=" & ObjData(Object).HechizoIndex

            If .Hombre > 0 Then Print #nfile, "ObjData(" & Object & ").hombre=" & .Hombre

            If .IndexAbierta > 0 Then Print #nfile, "ObjData(" & Object & ").indexabierta=" & ObjData(Object).IndexAbierta

            If .IndexCerrada > 0 Then Print #nfile, "ObjData(" & Object & ").indexcerrada=" & ObjData(Object).IndexCerrada

            If .IndexCerradaLlave > 0 Then Print #nfile, "ObjData(" & Object & ").indexcerradallave=" & .IndexCerradaLlave

            If .LingH > 0 Then Print #nfile, "ObjData(" & Object & ").lingh=" & .LingH

            If .LingO > 0 Then Print #nfile, "ObjData(" & Object & ").lingo=" & .LingO

            If .LingoteIndex > 0 Then Print #nfile, "ObjData(" & Object & ").lingoteindex=" & ObjData(Object).LingoteIndex

            If .LingP > 0 Then Print #nfile, "ObjData(" & Object & ").lingp=" & .LingP

            If .Llave > 0 Then Print #nfile, "ObjData(" & Object & ").llave=" & .Llave

            If .Madera > 0 Then Print #nfile, "ObjData(" & Object & ").madera=" & .Madera

            If .Magia > 0 Then Print #nfile, "ObjData(" & Object & ").magia=" & .Magia

            If .MaxDef > 0 Then Print #nfile, "ObjData(" & Object & ").maxdef=" & .MaxDef

            If .MaxHIT > 0 Then Print #nfile, "ObjData(" & Object & ").maxhit=" & .MaxHIT

            If .MaxHP > 0 Then Print #nfile, "ObjData(" & Object & ").maxhp=" & .MaxHP

            If .MaxItems > 0 Then Print #nfile, "ObjData(" & Object & ").maxitems=" & ObjData(Object).MaxItems

            If .MaxModificador > 0 Then Print #nfile, "ObjData(" & Object & ").maxmodificador=" & ObjData(Object).MaxModificador

            If .MinDef > 0 Then Print #nfile, "ObjData(" & Object & ").mindef=" & .MinDef

            'pluto:7.0
            If .Defmagica > 0 Then Print #nfile, "ObjData(" & Object & ").defmagica =" & ObjData(Object).Defmagica

            'nati: Agrego defCuerpo
            If .Defcuerpo > 0 Then Print #nfile, "ObjData(" & Object & ").defcuerpo =" & ObjData(Object).Defcuerpo
            'If .Defproyectil > 0 Then Print #nfile, "ObjData(" & Object & ").defproyectil =" & .Defproyectil

            If .MineralIndex > 0 Then Print #nfile, "ObjData(" & Object & ").mineralindex=" & ObjData(Object).MineralIndex

            If .MinHam > 0 Then Print #nfile, "ObjData(" & Object & ").minham=" & .MinHam

            If .MinHIT > 0 Then Print #nfile, "ObjData(" & Object & ").minhit=" & .MinHIT

            If .MinHP > 0 Then Print #nfile, "ObjData(" & Object & ").minhp=" & .MinHP

            If .MinInt > 0 Then Print #nfile, "ObjData(" & Object & ").minint=" & .MinInt

            If .MinModificador > 0 Then Print #nfile, "ObjData(" & Object & ").minmodificador=" & ObjData(Object).MinModificador

            If .MinSed > 0 Then Print #nfile, "ObjData(" & Object & ").minsed=" & .MinSed

            If .MinSkill > 0 Then Print #nfile, "ObjData(" & Object & ").minskill=" & ObjData(Object).MinSkill

            If .MinSta > 0 Then Print #nfile, "ObjData(" & Object & ").minsta=" & .MinSta

            If .Mujer > 0 Then Print #nfile, "ObjData(" & Object & ").mujer=" & .Mujer

            If .Municion > 0 Then Print #nfile, "ObjData(" & Object & ").municion=" & ObjData(Object).Municion

            If .Newbie > 0 Then Print #nfile, "ObjData(" & Object & ").Newbie=" & .Newbie

            If .nocaer > 0 Then Print #nfile, "ObjData(" & Object & ").nocaer=" & .nocaer

            If .ObjetoClan <> "" Then Print #nfile, "ObjData(" & Object & ").objetoclan=" & Chr(34) & .ObjetoClan & Chr(34)

            If .objetoespecial > 0 Then Print #nfile, "ObjData(" & Object & ").objetoespecial=" & ObjData(Object).objetoespecial

            If .OBJType > 0 Then Print #nfile, "ObjData(" & Object & ").objtype=" & .OBJType

            If .Peso > 0 Then Print #nfile, "ObjData(" & Object & ").peso=" & .Peso

            If .proyectil > 0 Then Print #nfile, "ObjData(" & Object & ").proyectil=" & ObjData(Object).proyectil

            If .razaelfa > 0 Then Print #nfile, "ObjData(" & Object & ").razaelfa=" & ObjData(Object).razaelfa

            If .RazaEnana > 0 Then Print #nfile, "ObjData(" & Object & ").razaenana=" & ObjData(Object).RazaEnana

            If .razahumana > 0 Then Print #nfile, "ObjData(" & Object & ").razahumana=" & ObjData(Object).razahumana

            If .razaorca > 0 Then Print #nfile, "ObjData(" & Object & ").razaorca=" & ObjData(Object).razaorca

            If .razavampiro > 0 Then Print #nfile, "ObjData(" & Object & ").razavampiro=" & ObjData(Object).razavampiro

            If .Real > 0 Then Print #nfile, "ObjData(" & Object & ").real=" & .Real

            If .Resistencia > 0 Then Print #nfile, "ObjData(" & Object & ").resistencia=" & ObjData(Object).Resistencia

            If .Respawn > 0 Then Print #nfile, "ObjData(" & Object & ").respawn=" & .Respawn

            If .Ropaje > 0 Then Print #nfile, "ObjData(" & Object & ").ropaje=" & .Ropaje

            If .ShieldAnim > 0 Then Print #nfile, "ObjData(" & Object & ").shieldanim=" & ObjData(Object).ShieldAnim

            If .SkArco > 0 Then Print #nfile, "ObjData(" & Object & ").skarco=" & .SkArco

            If .SkArma > 0 Then Print #nfile, "ObjData(" & Object & ").skarma=" & .SkArma

            If .SkCarpinteria > 0 Then Print #nfile, "ObjData(" & Object & ").skcarpinteria=" & ObjData(Object).SkCarpinteria

            If .SkHerreria > 0 Then Print #nfile, "ObjData(" & Object & ").skherreria=" & ObjData(Object).SkHerreria

            If .Snd1 > 0 Then Print #nfile, "ObjData(" & Object & ").snd1=" & .Snd1

            If .Snd2 > 0 Then Print #nfile, "ObjData(" & Object & ").snd2=" & .Snd2

            If .Snd3 > 0 Then Print #nfile, "ObjData(" & Object & ").snd3=" & .Snd3

            If .SubTipo > 0 Then Print #nfile, "ObjData(" & Object & ").subtipo=" & .SubTipo

            If .Texto <> "" Then Print #nfile, "ObjData(" & Object & ").texto=" & Chr(34) & ObjData(Object).Texto & Chr(34)

            If .TipoPocion > 0 Then Print #nfile, "ObjData(" & Object & ").tipopocion=" & ObjData(Object).TipoPocion

            If .Valor > 0 Then Print #nfile, "ObjData(" & Object & ").valor=" & .Valor

            If .Vendible > 0 Then Print #nfile, "ObjData(" & Object & ").vendible=" & ObjData(Object).Vendible

            If .WeaponAnim > 0 Then Print #nfile, "ObjData(" & Object & ").weaponanim=" & ObjData(Object).WeaponAnim

            If .Pregalo > 0 Then Print #nfile, "ObjData(" & Object & ").pregalo=" & .Pregalo

            If .Cregalos > 0 Then Print #nfile, "ObjData(" & Object & ").cregalos=" & ObjData(Object).Cregalos

            'pluto:7.0
            If .Drop > 0 Then Print #nfile, "ObjData(" & Object & ").drop=" & .Drop

            DoEvents

        End With

    Next
    
    Close #nfile

    Exit Sub

errhandler:
    MsgBox "error cargando objetos"

End Sub

'pluto:2.3
Sub LoadUserMontura(Userindex As Integer, UserFile As String)
'on error GoTo fallo
'Dim LoopC As Integer
'Dim Leer As New clsLeerInis
'Leer.Initialize userfile
'For LoopC = 1 To MAXMONTURA
'UserList(UserIndex).Montura.Nivel(LoopC) = val(Leer.GetValue("MONTURA", "NIVEL" & LoopC))
'UserList(UserIndex).Montura.exp(LoopC) = val(Leer.GetValue("MONTURA", "EXP" & LoopC))
'UserList(UserIndex).Montura.Elu(LoopC) = val(Leer.GetValue("MONTURA", "ELU" & LoopC))
'UserList(UserIndex).Montura.Vida(LoopC) = val(Leer.GetValue("MONTURA", "VIDA" & LoopC))
'UserList(UserIndex).Montura.Golpe(LoopC) = val(Leer.GetValue("MONTURA", "GOLPE" & LoopC))
'UserList(UserIndex).Montura.Nombre(LoopC) = Leer.GetValue("MONTURA", "NOMBRE" & LoopC)

'Next

'Exit Sub
'fallo:
'Call LogError("LOADUSERMONTURA" & Err.Number & " D: " & Err.Description)

End Sub

Sub LoadUserStats(Userindex As Integer, UserFile As String)
'on error GoTo fallo
'Dim LoopC As Integer

'For LoopC = 1 To NUMATRIBUTOS
' UserList(UserIndex).Stats.UserAtributos(LoopC) = Leer.GetValue( "ATRIBUTOS", "AT" & LoopC)
'UserList(UserIndex).Stats.UserAtributosBackUP(LoopC) = UserList(UserIndex).Stats.UserAtributos(LoopC)
'Next

'For LoopC = 1 To NUMSKILLS
' UserList(UserIndex).Stats.UserSkills(LoopC) = val(Leer.GetValue( "SKILLS", "SK" & LoopC))
'Next

'For LoopC = 1 To MAXUSERHECHIZOS
' UserList(UserIndex).Stats.UserHechizos(LoopC) = val(Leer.GetValue( "Hechizos", "H" & LoopC))
'Next
'pluto:2-3-04
'UserList(UserIndex).Stats.Puntos = val(Leer.GetValue( "STATS", "PUNTOS"))

'UserList(UserIndex).Stats.GLD = val(Leer.GetValue( "STATS", "GLD"))
'UserList(UserIndex).Remort = val(Leer.GetValue( "STATS", "REMORT"))
'UserList(UserIndex).Stats.Banco = val(Leer.GetValue( "STATS", "BANCO"))

'UserList(UserIndex).Stats.MET = val(Leer.GetValue( "STATS", "MET"))
'UserList(UserIndex).Stats.MaxHP = val(Leer.GetValue( "STATS", "MaxHP"))
'UserList(UserIndex).Stats.MinHP = val(Leer.GetValue( "STATS", "MinHP"))

'UserList(UserIndex).Stats.FIT = val(Leer.GetValue( "STATS", "FIT"))
'UserList(UserIndex).Stats.MinSta = val(Leer.GetValue( "STATS", "MinSTA"))
'UserList(UserIndex).Stats.MaxSta = val(Leer.GetValue( "STATS", "MaxSTA"))

'UserList(UserIndex).Stats.MaxMAN = val(Leer.GetValue( "STATS", "MaxMAN"))
'UserList(UserIndex).Stats.MinMAN = val(Leer.GetValue( "STATS", "MinMAN"))

'UserList(UserIndex).Stats.MaxHIT = val(Leer.GetValue( "STATS", "MaxHIT"))
'UserList(UserIndex).Stats.MinHIT = val(Leer.GetValue( "STATS", "MinHIT"))

'UserList(UserIndex).Stats.MaxAGU = val(Leer.GetValue( "STATS", "MaxAGU"))
'UserList(UserIndex).Stats.MinAGU = val(Leer.GetValue( "STATS", "MinAGU"))

'UserList(UserIndex).Stats.MaxHam = val(Leer.GetValue( "STATS", "MaxHAM"))
'UserList(UserIndex).Stats.MinHam = val(Leer.GetValue( "STATS", "MinHAM"))

'UserList(UserIndex).Stats.SkillPts = val(Leer.GetValue( "STATS", "SkillPtsLibres"))

'UserList(UserIndex).Stats.exp = val(Leer.GetValue( "STATS", "EXP"))
'UserList(UserIndex).Stats.Elu = val(Leer.GetValue( "STATS", "ELU"))
'UserList(UserIndex).Stats.ELV = val(Leer.GetValue( "STATS", "ELV"))
'pluto:2.4.5
'UserList(UserIndex).Stats.PClan = val(Leer.GetValue( "STATS", "PCLAN"))
'UserList(UserIndex).Stats.GTorneo = val(Leer.GetValue( "STATS", "GTORNEO"))

'UserList(UserIndex).Stats.UsuariosMatados = val(Leer.GetValue( "MUERTES", "UserMuertes"))
'UserList(UserIndex).Stats.CriminalesMatados = val(Leer.GetValue( "MUERTES", "CrimMuertes"))
'UserList(UserIndex).Stats.NPCsMuertos = val(Leer.GetValue( "MUERTES", "NpcsMuertes"))
'Exit Sub
'fallo:
'Call LogError("LOADUSERSTATS" & Err.Number & " D: " & Err.Description)

End Sub

Sub LoadUserReputacion(Userindex As Integer, UserFile As String)
'on error GoTo fallo
'UserList(UserIndex).Reputacion.AsesinoRep = val(Leer.GetValue( "REP", "Asesino"))
'UserList(UserIndex).Reputacion.BandidoRep = val(Leer.GetValue( "REP", "Dandido"))
'UserList(UserIndex).Reputacion.BurguesRep = val(Leer.GetValue( "REP", "Burguesia"))
'UserList(UserIndex).Reputacion.LadronesRep = val(Leer.GetValue( "REP", "Ladrones"))
'UserList(UserIndex).Reputacion.NobleRep = val(Leer.GetValue( "REP", "Nobles"))
'UserList(UserIndex).Reputacion.PlebeRep = val(Leer.GetValue( "REP", "Plebe"))
'UserList(UserIndex).Reputacion.Promedio = val(Leer.GetValue( "REP", "Promedio"))
'pluto:2-3-04
'If UserList(UserIndex).Faccion.FuerzasCaos > 0 And UserList(UserIndex).Reputacion.Promedio >= 0 Then Call ExpulsarCaos(UserIndex)
'Exit Sub
'fallo:
'Call LogError("LOADUSERREPUTACION" & Err.Number & " D: " & Err.Description)

End Sub

Sub LoadUserInit(Userindex As Integer, UserFile As String, Name As String)

    On Error GoTo fallo

    Dim loopc As Integer
    Dim ln    As String
    Dim Ln2   As String
    'pluto:2.24

    Dim leer  As New clsIniManager
    leer.Initialize UserFile

    With UserList(Userindex)
        
        .Faccion.Castigo = val(leer.GetValue("FACCIONES", "Castigo"))
        .Faccion.ArmadaReal = val(leer.GetValue("FACCIONES", "EjercitoReal"))
        .Faccion.SoyReal = val(leer.GetValue("FACCIONES", "SoyReal"))
        .Faccion.FuerzasCaos = val(leer.GetValue("FACCIONES", "EjercitoCaos"))
        .Faccion.SoyCaos = val(leer.GetValue("FACCIONES", "SoyCaos"))
        .Faccion.CiudadanosMatados = val(leer.GetValue("FACCIONES", "CiudMatados"))
        .Faccion.NeutralesMatados = val(leer.GetValue("FACCIONES", "NeutMatados"))
        .Faccion.CriminalesMatados = val(leer.GetValue("FACCIONES", "CrimMatados"))
        .Faccion.RecibioArmaduraCaos = val(leer.GetValue("FACCIONES", "rArCaos"))
        .Faccion.RecibioArmaduraReal = val(leer.GetValue("FACCIONES", "rArReal"))
        .Faccion.RecibioArmaduraLegion = val(leer.GetValue("FACCIONES", "rArLegion"))
        .Faccion.RecibioExpInicialCaos = val(leer.GetValue("FACCIONES", "rExCaos"))
        .Faccion.RecibioExpInicialReal = val(leer.GetValue("FACCIONES", "rExReal"))
        .Faccion.RecompensasCaos = val(leer.GetValue("FACCIONES", "recCaos"))
        .Faccion.RecompensasReal = val(leer.GetValue("FACCIONES", "recReal"))
        .flags.LiderAlianza = val(leer.GetValue("FLAGS", "LiderAlianza"))
        .flags.LiderHorda = val(leer.GetValue("FLAGS", "LiderHorda"))
        .flags.Revisar = val(leer.GetValue("FLAGS", "Revisar"))
        .flags.Muerto = val(leer.GetValue("FLAGS", "Muerto"))
        .flags.Escondido = val(leer.GetValue("FLAGS", "Escondido"))
        .flags.Hambre = val(leer.GetValue("FLAGS", "Hambre"))
        .flags.Sed = val(leer.GetValue("FLAGS", "Sed"))
        .flags.Desnudo = val(leer.GetValue("FLAGS", "Desnudo"))
        .flags.Envenenado = val(leer.GetValue("FLAGS", "Envenenado"))
        .flags.Morph = val(leer.GetValue("FLAGS", "Morph"))
        .flags.Paralizado = val(leer.GetValue("FLAGS", "Paralizado"))
        .flags.Angel = val(leer.GetValue("FLAGS", "Angel"))
        .flags.Demonio = val(leer.GetValue("FLAGS", "Demonio"))
        'pluto:6.5
        .flags.Minotauro = val(leer.GetValue("FLAGS", "Minotauro"))
        'pluto:7.0
        .flags.Creditos = val(leer.GetValue("FLAGS", "Creditos"))
        .flags.DragCredito1 = val(leer.GetValue("FLAGS", "DragC1"))
        .flags.DragCredito2 = val(leer.GetValue("FLAGS", "DragC2"))
        .flags.DragCredito3 = val(leer.GetValue("FLAGS", "DragC3"))
        .flags.DragCredito4 = val(leer.GetValue("FLAGS", "DragC4"))
        .flags.DragCredito5 = val(leer.GetValue("FLAGS", "DragC5"))
        'pluto:6.9
        .flags.DragCredito6 = val(leer.GetValue("FLAGS", "DragC6"))

        .flags.Elixir = val(leer.GetValue("FLAGS", "Elixir"))
        '---------------------

        .flags.Navegando = val(leer.GetValue("FLAGS", "Navegando"))
        .flags.Montura = val(leer.GetValue("FLAGS", "Montura"))
        .flags.ClaseMontura = val(leer.GetValue("FLAGS", "ClaseMontura"))
        .Counters.Pena = val(leer.GetValue("COUNTERS", "Pena"))
        .EmailActual = leer.GetValue("CONTACTO", "EmailActual")
        .Email = leer.GetValue("CONTACTO", "Email")
        .Remorted = leer.GetValue("INIT", "RAZAREMORT")
        'pluto:6.0A
        .BD = val(leer.GetValue("INIT", "BD"))

        .Genero = leer.GetValue("INIT", "Genero")
        .clase = leer.GetValue("INIT", "Clase")
        .raza = leer.GetValue("INIT", "Raza")
        .Hogar = leer.GetValue("INIT", "Hogar")
        .Char.Heading = val(leer.GetValue("INIT", "Heading"))
        .Esposa = Trim$(leer.GetValue("INIT", "Esposa"))
        .Paquete = 0
        'pluto:2.24-------------------------------
        'Dim filexx As String

        'If .Esposa = "0" Then
        'filexx = "C:\Esposas\Charfile\" & Left$(UCase$(Name), 1) & "\" & UCase$(Name) & ".chr"
        '.Esposa = GetVar(filexx, "INIT", "Esposa")
        'End If
        '-----------------------------------------

        .Nhijos = val(leer.GetValue("INIT", "Nhijos"))

        For loopc = 1 To 5
            .Hijo(loopc) = Trim$(leer.GetValue("INIT", "Hijo" & loopc))
        Next

        .Amor = val(leer.GetValue("INIT", "Amor"))
        .Embarazada = val(leer.GetValue("INIT", "Embarazada"))
        .Bebe = val(leer.GetValue("INIT", "Bebe"))
        .NombreDelBebe = Trim$(leer.GetValue("INIT", "NombreDelBebe"))
        .Padre = Trim$(leer.GetValue("INIT", "Padre"))
        .Madre = Trim$(leer.GetValue("INIT", "Madre"))
        .OrigChar.Head = val(leer.GetValue("INIT", "Head"))
        .OrigChar.Body = val(leer.GetValue("INIT", "Body"))
        .OrigChar.WeaponAnim = val(leer.GetValue("INIT", "Arma"))
        .OrigChar.ShieldAnim = val(leer.GetValue("INIT", "Escudo"))
        .OrigChar.CascoAnim = val(leer.GetValue("INIT", "Casco"))
        .OrigChar.Botas = val(leer.GetValue("INIT", "Botas"))
        .OrigChar.AlasAnim = val(leer.GetValue("INIT", "Alas"))
        .UltimoLogeo = val(leer.GetValue("INIT", "UltimoLogeo"))
        .UltimaDenuncia = val(leer.GetValue("INIT", "UltimaDenuncia"))
        .PrimeraDenuncia = val(leer.GetValue("INIT", "PrimeraDenuncia"))

        '[Tite]Party
        .flags.party = False
        .flags.partyNum = 0
        .flags.invitado = ""
        '[\Tite]
  
        .OrigChar.Heading = SOUTH

        If .flags.Muerto = 0 Then
            .Char = .OrigChar
        Else

            If Not Criminal(Userindex) Then .Char.Body = iCuerpoMuerto Else UserList(Userindex).Char.Body = iCuerpoMuerto2

            If Not Criminal(Userindex) Then .Char.Head = iCabezaMuerto Else UserList(Userindex).Char.Head = iCabezaMuerto2
            .Char.WeaponAnim = NingunArma
            .Char.ShieldAnim = NingunEscudo
            .Char.CascoAnim = NingunCasco
            '[GAU]
            .Char.Botas = NingunBota
            .Char.AlasAnim = NingunAla

            '[GAU]
        End If

        .Desc = Trim$(leer.GetValue("INIT", "Desc"))
        '.Desc = Leer.GetValue("INIT", "Desc")

        .Pos.Map = val(ReadField(1, leer.GetValue("INIT", "Position"), 45))
        .Pos.X = val(ReadField(2, leer.GetValue("INIT", "Position"), 45))
        .Pos.Y = val(ReadField(3, leer.GetValue("INIT", "Position"), 45))
        '.Faccion.RecompensasReal = val(leer.GetValue("FACCIONES", "recReal"))

        'Delzak
        'If .Pos.Map <> 0 Then Call BuscaPosicionValida(UserIndex)

        '.Invent.NroItems = Leer.GetValue( "Inventory", "CantidadItems")
        .Invent.NroItems = leer.GetValue("Inventory", "CantidadItems")
        Dim loopd As Integer

        '[KEVIN]--------------------------------------------------------------------

        '***********************************************************************************
        'pluto:7.0 quito todo esto lo paso a cuentas

        '.BancoInvent.NroItems = val(Leer.GetValue("BancoInventory", "CantidadItems"))

        'Lista de objetos del banco
        'For loopd = 1 To MAX_BANCOINVENTORY_SLOTS

        '   ln2 = Leer.GetValue("BancoInventory", "Obj" & loopd)

        '  .BancoInvent.Object(loopd).ObjIndex = val(ReadField(1, ln2, 45))
        ' .BancoInvent.Object(loopd).Amount = val(ReadField(2, ln2, 45))
        'Next loopd
        '------------------------------------------------------------------------------------

        '[/KEVIN]*****************************************************************************

        'Lista de objetos
        For loopc = 1 To MAX_INVENTORY_SLOTS
            'ln = Leer.GetValue( "Inventory", "Obj" & LoopC)
            ln = leer.GetValue("Inventory", "Obj" & loopc)

            .Invent.Object(loopc).ObjIndex = val(ReadField(1, ln, 45))
            .Invent.Object(loopc).Amount = val(ReadField(2, ln, 45))
            .Invent.Object(loopc).Equipped = val(ReadField(3, ln, 45))
        Next loopc

        'Obtiene el indice-objeto del arma
        '.Invent.WeaponEqpSlot = val(Leer.GetValue( "Inventory", "WeaponEqpSlot"))
        .Invent.WeaponEqpSlot = val(leer.GetValue("Inventory", "WeaponEqpSlot"))

        If .Invent.WeaponEqpSlot > 0 Then
            .Invent.WeaponEqpObjIndex = .Invent.Object(UserList(Userindex).Invent.WeaponEqpSlot).ObjIndex

        End If

        'Obtiene el indice-objeto del anillo
        '.Invent.AnilloEqpSlot = val(Leer.GetValue( "Inventory", "AnilloEqpSlot"))
        .Invent.AnilloEqpSlot = val(leer.GetValue("Inventory", "AnilloEqpSlot"))

        If .Invent.AnilloEqpSlot > 0 Then
            .Invent.AnilloEqpObjIndex = .Invent.Object(UserList(Userindex).Invent.AnilloEqpSlot).ObjIndex

        End If

        'Obtiene el indice-objeto del armadura
        '.Invent.ArmourEqpSlot = val(Leer.GetValue( "Inventory", "ArmourEqpSlot"))
        .Invent.ArmourEqpSlot = val(leer.GetValue("Inventory", "ArmourEqpSlot"))

        If .Invent.ArmourEqpSlot > 0 Then
            .Invent.ArmourEqpObjIndex = .Invent.Object(UserList(Userindex).Invent.ArmourEqpSlot).ObjIndex
            .flags.Desnudo = 0
        Else
            .flags.Desnudo = 1

        End If

        'Obtiene el indice-objeto del escudo
        '.Invent.EscudoEqpSlot = val(Leer.GetValue( "Inventory", "EscudoEqpSlot"))
        .Invent.EscudoEqpSlot = val(leer.GetValue("Inventory", "EscudoEqpSlot"))

        If .Invent.EscudoEqpSlot > 0 Then
            .Invent.EscudoEqpObjIndex = .Invent.Object(UserList(Userindex).Invent.EscudoEqpSlot).ObjIndex

        End If

        'Obtiene el indice-objeto del casco
        '.Invent.CascoEqpSlot = val(Leer.GetValue( "Inventory", "CascoEqpSlot"))
        .Invent.CascoEqpSlot = val(leer.GetValue("Inventory", "CascoEqpSlot"))

        If .Invent.CascoEqpSlot > 0 Then
            .Invent.CascoEqpObjIndex = .Invent.Object(UserList(Userindex).Invent.CascoEqpSlot).ObjIndex

        End If

        .Invent.AlaEqpSlot = val(leer.GetValue("Inventory", "AlaEqpSlot"))

        If .Invent.AlaEqpSlot > 0 Then
            .Invent.AlaEqpObjIndex = .Invent.Object(UserList(Userindex).Invent.AlaEqpSlot).ObjIndex

        End If

        '[GAU]
        'Obtiene el indice-objeto de las botas
        '.Invent.BotaEqpSlot = val(Leer.GetValue( "Inventory", "BotaEqpSlot"))
        .Invent.BotaEqpSlot = val(leer.GetValue("Inventory", "BotaEqpSlot"))

        If .Invent.BotaEqpSlot > 0 Then
            .Invent.BotaEqpObjIndex = .Invent.Object(UserList(Userindex).Invent.BotaEqpSlot).ObjIndex

        End If

        '[GAU]
        'Obtiene el indice-objeto barco
        '.Invent.BarcoSlot = val(Leer.GetValue( "Inventory", "BarcoSlot"))
        .Invent.BarcoSlot = val(leer.GetValue("Inventory", "BarcoSlot"))

        If .Invent.BarcoSlot > 0 Then
            .Invent.BarcoObjIndex = .Invent.Object(UserList(Userindex).Invent.BarcoSlot).ObjIndex

        End If

        'Obtiene el indice-objeto barco
        '.Invent.MunicionEqpSlot = val(Leer.GetValue( "Inventory", "MunicionSlot"))
        .Invent.MunicionEqpSlot = val(leer.GetValue("Inventory", "MunicionSlot"))

        If .Invent.MunicionEqpSlot > 0 Then
            .Invent.MunicionEqpObjIndex = .Invent.Object(UserList(Userindex).Invent.MunicionEqpSlot).ObjIndex

        End If

        '.NroMacotas = val(Leer.GetValue( "Mascotas", "NroMascotas"))
        .NroMacotas = val(leer.GetValue("Mascotas", "NroMascotas"))

        If .NroMacotas < 0 Then .NroMacotas = 0

        'Lista de objetos
        For loopc = 1 To MAXMASCOTAS
            ' .MascotasType(LoopC) = val(Leer.GetValue( "Mascotas", "Mas" & LoopC))
            .MascotasType(loopc) = val(leer.GetValue("Mascotas", "Mas" & loopc))
        Next loopc

        '.GuildInfo.FundoClan = val(Leer.GetValue( "Guild", "FundoClan"))
        '.GuildInfo.EsGuildLeader = val(Leer.GetValue( "Guild", "EsGuildLeader"))
        '.GuildInfo.Echadas = val(Leer.GetValue( "Guild", "Echadas"))
        '.GuildInfo.Solicitudes = val(Leer.GetValue( "Guild", "Solicitudes"))
        '.GuildInfo.SolicitudesRechazadas = val(Leer.GetValue( "Guild", "SolicitudesRechazadas"))
        '.GuildInfo.VecesFueGuildLeader = val(Leer.GetValue( "Guild", "VecesFueGuildLeader"))
        '.GuildInfo.YaVoto = val(Leer.GetValue( "Guild", "YaVoto"))
        '.GuildInfo.ClanesParticipo = val(Leer.GetValue( "Guild", "ClanesParticipo"))
        '.GuildInfo.GuildPoints = val(Leer.GetValue( "Guild", "GuildPts"))
        '.GuildInfo.ClanFundado = Leer.GetValue( "Guild", "ClanFundado")
        '.GuildInfo.GuildName = Leer.GetValue( "Guild", "GuildName")

        .GuildInfo.FundoClan = val(leer.GetValue("Guild", "FundoClan"))
        .GuildInfo.EsGuildLeader = val(leer.GetValue("Guild", "EsGuildLeader"))
        .GuildInfo.Echadas = val(leer.GetValue("Guild", "Echadas"))
        .GuildInfo.Solicitudes = val(leer.GetValue("Guild", "Solicitudes"))
        .GuildInfo.SolicitudesRechazadas = val(leer.GetValue("Guild", "SolicitudesRechazadas"))
        .GuildInfo.VecesFueGuildLeader = val(leer.GetValue("Guild", "VecesFueGuildLeader"))
        .GuildInfo.YaVoto = val(leer.GetValue("Guild", "Yavoto"))
        .GuildInfo.ClanesParticipo = val(leer.GetValue("Guild", "ClanesParticipo"))
        .GuildInfo.GuildPoints = val(leer.GetValue("Guild", "GuildPts"))
        .GuildInfo.ClanFundado = Trim$(leer.GetValue("Guild", "ClanFundado"))
        .GuildInfo.GuildName = Trim$(leer.GetValue("Guild", "GuildName"))

        'loaduserstats-------------------------------
        For loopc = 1 To NUMATRIBUTOS
            .Stats.UserAtributos(loopc) = leer.GetValue("ATRIBUTOS", "AT" & loopc)
            .Stats.UserAtributosBackUP(loopc) = .Stats.UserAtributos(loopc)
        Next
        'pluto:7.0
        .UserDañoProyetilesRaza = val(leer.GetValue("PORC", "P1"))
        .UserDañoArmasRaza = val(leer.GetValue("PORC", "P2"))
        .UserDañoMagiasRaza = val(leer.GetValue("PORC", "P3"))
        .UserDefensaMagiasRaza = val(leer.GetValue("PORC", "P4"))
        .UserEvasiónRaza = val(leer.GetValue("PORC", "P5"))
        .UserDefensaEscudos = val(leer.GetValue("PORC", "P6"))

        If .UserDañoProyetilesRaza + .UserDañoArmasRaza + UserList(Userindex).UserDañoMagiasRaza + .UserDefensaMagiasRaza + UserList(Userindex).UserEvasiónRaza + .UserDefensaEscudos > 15 Then
            .UserDañoArmasRaza = 5
            .UserDañoMagiasRaza = 5
            .UserDefensaMagiasRaza = 5

        End If

        For loopc = 1 To NUMSKILLS
            .Stats.UserSkills(loopc) = val(leer.GetValue("SKILLS", "SK" & loopc))
        Next

        For loopc = 1 To MAXUSERHECHIZOS
            .Stats.UserHechizos(loopc) = val(leer.GetValue("Hechizos", "H" & loopc))
        Next
        'pluto:2-3-04
        .Stats.Puntos = val(leer.GetValue("STATS", "PUNTOS"))

        .Stats.GLD = val(leer.GetValue("STATS", "GLD"))
        .Remort = val(leer.GetValue("STATS", "REMORT"))
        .Stats.Banco = val(leer.GetValue("STATS", "BANCO"))

        .Stats.MET = val(leer.GetValue("STATS", "MET"))
        .Stats.MaxHP = val(leer.GetValue("STATS", "MaxHP"))
        .Stats.MinHP = val(leer.GetValue("STATS", "MinHP"))

        .Stats.FIT = val(leer.GetValue("STATS", "FIT"))
        .Stats.MinSta = val(leer.GetValue("STATS", "MinSTA"))
        .Stats.MaxSta = val(leer.GetValue("STATS", "MaxSTA"))

        .Stats.MaxMAN = val(leer.GetValue("STATS", "MaxMAN"))
        .Stats.MinMAN = val(leer.GetValue("STATS", "MinMAN"))

        .Stats.MaxHIT = val(leer.GetValue("STATS", "MaxHIT"))
        .Stats.MinHIT = val(leer.GetValue("STATS", "MinHIT"))

        .Stats.MaxAGU = val(leer.GetValue("STATS", "MaxAGU"))
        .Stats.MinAGU = val(leer.GetValue("STATS", "MinAGU"))

        .Stats.MaxHam = val(leer.GetValue("STATS", "MaxHAM"))
        .Stats.MinHam = val(leer.GetValue("STATS", "MinHAM"))

        .Stats.SkillPts = val(leer.GetValue("STATS", "SkillPtsLibres"))

        .Stats.exp = val(leer.GetValue("STATS", "EXP"))
        .Stats.Elu = val(leer.GetValue("STATS", "ELU"))
        .Stats.ELV = val(leer.GetValue("STATS", "ELV"))
        .Stats.Elo = val(leer.GetValue("STATS", "ELO"))
        
        .Stats.LibrosUsados = val(leer.GetValue("STATS", "LIBROSUSADOS"))
        .Stats.Fama = val(leer.GetValue("STATS", "FAMA"))
        'pluto:2.4.5
        .Stats.PClan = val(leer.GetValue("STATS", "PCLAN"))
        .Stats.GTorneo = val(leer.GetValue("STATS", "GTORNEO"))

        .Stats.UsuariosMatados = val(leer.GetValue("MUERTES", "UserMuertes"))
        .Stats.CriminalesMatados = val(leer.GetValue("MUERTES", "CrimMuertes"))
        .Stats.NPCsMuertos = val(leer.GetValue("MUERTES", "NpcsMuertes"))
        '--------------------------------------------

        'Delzak-----------------------------------------
        '...............................................
        '              SISTEMA PREMIOS
        '...............................................
        '--Modificado por Pluto:7.0---------------------

        'Stats de premios por matar NPCs
        For loopc = 1 To 34
            .Stats.PremioNPC(loopc) = val(leer.GetValue("PREMIOS", "L" & loopc))
        Next
        '--------------------------------------------

        'PLUTO 6.0A  loadusermonturas ---------------------------

        .Nmonturas = val(leer.GetValue("MONTURAS", "NroMonturas"))

        Dim n As Byte

        For n = 1 To 3

            If val(leer.GetValue("MONTURA" & n, "TIPO")) > 0 Then
                loopc = val(leer.GetValue("MONTURA" & n, "TIPO"))

                .Montura.Tipo(loopc) = val(leer.GetValue("MONTURA" & n, "TIPO"))
                .Montura.Nivel(loopc) = val(leer.GetValue("MONTURA" & n, "NIVEL"))
                .Montura.exp(loopc) = val(leer.GetValue("MONTURA" & n, "EXP"))
                .Montura.Elu(loopc) = val(leer.GetValue("MONTURA" & n, "ELU"))
                .Montura.Vida(loopc) = val(leer.GetValue("MONTURA" & n, "VIDA"))
                .Montura.Golpe(loopc) = val(leer.GetValue("MONTURA" & n, "GOLPE"))
                .Montura.Nombre(loopc) = Trim$(leer.GetValue("MONTURA" & n, "NOMBRE"))
                .Montura.AtCuerpo(loopc) = val(leer.GetValue("MONTURA" & n, "ATCUERPO"))
                .Montura.Defcuerpo(loopc) = val(leer.GetValue("MONTURA" & n, "DEFCUERPO"))
                .Montura.AtFlechas(loopc) = val(leer.GetValue("MONTURA" & n, "ATFLECHAS"))
                .Montura.DefFlechas(loopc) = val(leer.GetValue("MONTURA" & n, "DEFFLECHAS"))
                .Montura.AtMagico(loopc) = val(leer.GetValue("MONTURA" & n, "ATMAGICO"))
                .Montura.DefMagico(loopc) = val(leer.GetValue("MONTURA" & n, "DEFMAGICO"))
                .Montura.Evasion(loopc) = val(leer.GetValue("MONTURA" & n, "EVASION"))
                .Montura.Libres(loopc) = val(leer.GetValue("MONTURA" & n, "LIBRES"))
                .Montura.index(loopc) = n

            End If

        Next n

        '---------------------------------------------

        'loaduserreputacion---------------------------
        .Reputacion.AsesinoRep = val(leer.GetValue("REP", "Asesino"))
        .Reputacion.BandidoRep = val(leer.GetValue("REP", "Dandido"))
        .Reputacion.BurguesRep = val(leer.GetValue("REP", "Burguesia"))
        .Reputacion.LadronesRep = val(leer.GetValue("REP", "Ladrones"))
        .Reputacion.NobleRep = val(leer.GetValue("REP", "Nobles"))
        .Reputacion.PlebeRep = val(leer.GetValue("REP", "Plebe"))
        .Reputacion.Promedio = val(leer.GetValue("REP", "Promedio"))

        'pluto:2-3-04
        'If UserList(Userindex).Faccion.FuerzasCaos > 0 And UserList(Userindex).Reputacion.Promedio >= 0 Then Call _
         ExpulsarCaos(Userindex)
        '------------------------------------------------------

        Call LoadQuestStats(Userindex, leer)

    End With

    Exit Sub
fallo:
    Call LogError("LOADUSERINIT" & Err.number & " D: " & Err.Description)

End Sub

Function GetVar(File As String, Main As String, Var As String) As String

    On Error GoTo fallo

    Dim sSpaces As String    ' This will hold the input that the program will retrieve
    Dim szReturn As String    ' This will be the defaul value if the string is not found

    szReturn = ""

    sSpaces = Space(5000)    ' This tells the computer how long the longest string can be

    GetPrivateProfileString Main, Var, szReturn, sSpaces, Len(sSpaces), File

    GetVar = RTrim(sSpaces)
    GetVar = Left$(GetVar, Len(GetVar) - 1)
    Exit Function
fallo:
    Call LogError("GETVAR" & Err.number & " D: " & Err.Description)

End Function

Sub LoadSini()

    On Error GoTo fallo

    Dim Temporal As Long
    Dim Temporal1 As Long

    If frmMain.Visible Then frmMain.txStatus.Caption = "Cargando info de inicio del server."

    BootDelBackUp = val(GetVar(IniPath & "Server.ini", "INIT", "IniciarDesdeBackUp"))

    ServerIp = GetVar(IniPath & "Server.ini", "INIT", "ServerIp")
    Temporal = InStr(1, ServerIp, ".")
    Temporal1 = (mid(ServerIp, 1, Temporal - 1) And &H7F) * 16777216
    ServerIp = mid(ServerIp, Temporal + 1, Len(ServerIp))
    Temporal = InStr(1, ServerIp, ".")
    Temporal1 = Temporal1 + mid(ServerIp, 1, Temporal - 1) * 65536
    ServerIp = mid(ServerIp, Temporal + 1, Len(ServerIp))
    Temporal = InStr(1, ServerIp, ".")
    Temporal1 = Temporal1 + mid(ServerIp, 1, Temporal - 1) * 256
    ServerIp = mid(ServerIp, Temporal + 1, Len(ServerIp))

    Puerto = val(GetVar(IniPath & "Server.ini", "INIT", "StartPort"))
    HideMe = val(GetVar(IniPath & "Server.ini", "INIT", "Hide"))
    AllowMultiLogins = val(GetVar(IniPath & "Server.ini", "INIT", "AllowMultiLogins"))
    IdleLimit = val(GetVar(IniPath & "Server.ini", "INIT", "IdleLimit"))
    'Lee la version correcta del cliente
    ULTIMAVERSION = GetVar(IniPath & "Server.ini", "INIT", "Version")
    'pluto:6.9
    TOPELANZAR = val(GetVar(IniPath & "Server.ini", "INIT", "AvisoLanzar"))
    TOPEFLECHA = val(GetVar(IniPath & "Server.ini", "INIT", "AvisoFlecha"))

    ArmaduraImperial1 = val(GetVar(IniPath & "Server.ini", "INIT", "ArmaduraImperial1"))
    ArmaduraImperial2 = val(GetVar(IniPath & "Server.ini", "INIT", "ArmaduraImperial2"))
    ArmaduraImperial3 = val(GetVar(IniPath & "Server.ini", "INIT", "ArmaduraImperial3"))
    TunicaMagoImperial = val(GetVar(IniPath & "Server.ini", "INIT", "TunicaMagoImperial"))
    TunicaMagoImperialEnanos = val(GetVar(IniPath & "Server.ini", "INIT", "TunicaMagoImperialEnanos"))

    ArmaduraCaos1 = val(GetVar(IniPath & "Server.ini", "INIT", "ArmaduraCaos1"))
    ArmaduraCaos2 = val(GetVar(IniPath & "Server.ini", "INIT", "ArmaduraCaos2"))
    ArmaduraCaos3 = val(GetVar(IniPath & "Server.ini", "INIT", "ArmaduraCaos3"))
    TunicaMagoCaos = val(GetVar(IniPath & "Server.ini", "INIT", "TunicaMagoCaos"))
    TunicaMagoCaosEnanos = val(GetVar(IniPath & "Server.ini", "INIT", "TunicaMagoCaosEnanos"))
    'ropa legion
    ArmaduraLegion1 = val(GetVar(IniPath & "Server.ini", "INIT", "Armaduralegion1"))
    ArmaduraLegion2 = val(GetVar(IniPath & "Server.ini", "INIT", "Armaduralegion2"))
    ArmaduraLegion3 = val(GetVar(IniPath & "Server.ini", "INIT", "Armaduralegion3"))
    TunicaMagoLegion = val(GetVar(IniPath & "Server.ini", "INIT", "TunicaMagolegion"))
    TunicaMagoLegionEnanos = val(GetVar(IniPath & "Server.ini", "INIT", "TunicaMagolegionEnanos"))
    'castillos clanes
    castillo1 = GetVar(IniPath & "castillos.txt", "INIT", "Castillo1")
    castillo2 = GetVar(IniPath & "castillos.txt", "INIT", "Castillo2")
    castillo3 = GetVar(IniPath & "castillos.txt", "INIT", "Castillo3")
    castillo4 = GetVar(IniPath & "castillos.txt", "INIT", "Castillo4")
    fortaleza = GetVar(IniPath & "castillos.txt", "INIT", "fortaleza")
    'ciudades dueños
    'DueñoNix = val(GetVar(IniPath & "ciudades.txt", "INIT", "NIX"))
    'DueñoCaos = val(GetVar(IniPath & "ciudades.txt", "INIT", "CAOS"))
    'DueñoUlla = val(GetVar(IniPath & "ciudades.txt", "INIT", "ULLA"))
    'DueñoBander = val(GetVar(IniPath & "ciudades.txt", "INIT", "BANDER"))
    'DueñoDescanso = val(GetVar(IniPath & "ciudades.txt", "INIT", "DESCANSO"))
    'DueñoQuest = val(GetVar(IniPath & "ciudades.txt", "INIT", "QUEST"))
    'DueñoArghal = val(GetVar(IniPath & "ciudades.txt", "INIT", "ARGHAL"))
    'DueñoLaurana = val(GetVar(IniPath & "ciudades.txt", "INIT", "LAURANA"))
    'DueñoLindos = val(GetVar(IniPath & "ciudades.txt", "INIT", "LINDOS"))

    hora1 = GetVar(IniPath & "castillos.txt", "INIT", "hora1")
    hora2 = GetVar(IniPath & "castillos.txt", "INIT", "hora2")
    hora3 = GetVar(IniPath & "castillos.txt", "INIT", "hora3")
    hora4 = GetVar(IniPath & "castillos.txt", "INIT", "hora4")
    hora5 = GetVar(IniPath & "castillos.txt", "INIT", "hora5")
    date1 = GetVar(IniPath & "castillos.txt", "INIT", "date1")
    date2 = GetVar(IniPath & "castillos.txt", "INIT", "date2")
    date3 = GetVar(IniPath & "castillos.txt", "INIT", "date3")
    date4 = GetVar(IniPath & "castillos.txt", "INIT", "date4")
    date5 = GetVar(IniPath & "castillos.txt", "INIT", "date5")

    ClientsCommandsQueue = val(GetVar(IniPath & "Server.ini", "INIT", "ClientsCommandsQueue"))

    If ClientsCommandsQueue <> 0 Then
        frmMain.CmdExec.Enabled = True
    Else
        frmMain.CmdExec.Enabled = False

    End If

    'Start pos
    StartPos.Map = val(ReadField(1, GetVar(IniPath & "Server.ini", "INIT", "StartPos"), 45))
    StartPos.X = val(ReadField(2, GetVar(IniPath & "Server.ini", "INIT", "StartPos"), 45))
    StartPos.Y = val(ReadField(3, GetVar(IniPath & "Server.ini", "INIT", "StartPos"), 45))

    'Intervalos
    SanaIntervaloSinDescansar = val(GetVar(IniPath & "Server.ini", "INTERVALOS", "SanaIntervaloSinDescansar"))
    FrmInterv.txtSanaIntervaloSinDescansar.Text = SanaIntervaloSinDescansar

    StaminaIntervaloSinDescansar = val(GetVar(IniPath & "Server.ini", "INTERVALOS", "StaminaIntervaloSinDescansar"))
    FrmInterv.txtStaminaIntervaloSinDescansar.Text = StaminaIntervaloSinDescansar

    SanaIntervaloDescansar = val(GetVar(IniPath & "Server.ini", "INTERVALOS", "SanaIntervaloDescansar"))
    FrmInterv.txtSanaIntervaloDescansar.Text = SanaIntervaloDescansar

    StaminaIntervaloDescansar = val(GetVar(IniPath & "Server.ini", "INTERVALOS", "StaminaIntervaloDescansar"))
    FrmInterv.txtStaminaIntervaloDescansar.Text = StaminaIntervaloDescansar

    IntervaloSed = val(GetVar(IniPath & "Server.ini", "INTERVALOS", "IntervaloSed"))
    FrmInterv.txtIntervaloSed.Text = IntervaloSed

    IntervaloHambre = val(GetVar(IniPath & "Server.ini", "INTERVALOS", "IntervaloHambre"))
    FrmInterv.txtIntervaloHambre.Text = IntervaloHambre

    IntervaloVeneno = val(GetVar(IniPath & "Server.ini", "INTERVALOS", "IntervaloVeneno"))
    FrmInterv.txtIntervaloVeneno.Text = IntervaloVeneno

    IntervaloParalizado = val(GetVar(IniPath & "Server.ini", "INTERVALOS", "IntervaloParalizado"))
    FrmInterv.txtIntervaloParalizado.Text = IntervaloParalizado

    IntervaloParalisisPJ = val(GetVar(IniPath & "Server.ini", "INTERVALOS", "IntervaloParalisisPJ"))
    'FrmInterv.txtIntervaloParalisisPJ.Text = IntervaloParalisisPJ
    IntervaloMorphPJ = val(GetVar(IniPath & "Server.ini", "INTERVALOS", "IntervaloMorphPJ"))
    Intervaloceguera = val(GetVar(IniPath & "Server.ini", "INTERVALOS", "Intervaloceguera"))
    'FrmInterv.txtIntervaloceguera.Text = Intervaloceguera

    IntervaloInvisible = val(GetVar(IniPath & "Server.ini", "INTERVALOS", "IntervaloInvisible"))
    FrmInterv.txtIntervaloInvisible.Text = IntervaloInvisible

    IntervaloFrio = val(GetVar(IniPath & "Server.ini", "INTERVALOS", "IntervaloFrio"))
    FrmInterv.txtIntervaloFrio.Text = IntervaloFrio

    IntervaloWavFx = val(GetVar(IniPath & "Server.ini", "INTERVALOS", "IntervaloWAVFX"))
    FrmInterv.txtIntervaloWAVFX.Text = IntervaloWavFx

    IntervaloInvocacion = val(GetVar(IniPath & "Server.ini", "INTERVALOS", "IntervaloInvocacion"))
    FrmInterv.txtInvocacion.Text = IntervaloInvocacion

    IntervaloParaConexion = val(GetVar(IniPath & "Server.ini", "INTERVALOS", "IntervaloParaConexion"))
    FrmInterv.txtIntervaloParaConexion.Text = IntervaloParaConexion

    '&&&&&&&&&&&&&&&&&&&&& TIMERS &&&&&&&&&&&&&&&&&&&&&&&

    IntervaloUserPuedeCastear = val(GetVar(IniPath & "Server.ini", "INTERVALOS", "IntervaloLanzaHechizo"))
    FrmInterv.txtIntervaloLanzaHechizo.Text = IntervaloUserPuedeCastear

    frmMain.TIMER_AI.Interval = val(GetVar(IniPath & "Server.ini", "INTERVALOS", "IntervaloNpcAI"))
    FrmInterv.txtAI.Text = frmMain.TIMER_AI.Interval

    frmMain.npcataca.Interval = val(GetVar(IniPath & "Server.ini", "INTERVALOS", "IntervaloNpcPuedeAtacar"))
    FrmInterv.txtNPCPuedeAtacar.Text = frmMain.npcataca.Interval

    IntervaloUserPuedeTrabajar = val(GetVar(IniPath & "Server.ini", "INTERVALOS", "IntervaloTrabajo"))
    FrmInterv.txtTrabajo.Text = IntervaloUserPuedeTrabajar
    'pluto:2.8.0
    IntervaloUserPuedeFlechas = val(GetVar(IniPath & "Server.ini", "INTERVALOS", "IntervaloFlechas"))
    FrmInterv.TxtFlechas.Text = IntervaloUserPuedeFlechas

    IntervaloRegeneraVampiro = val(GetVar(IniPath & "Server.ini", "INTERVALOS", "IntervaloRegeneraVampiro"))
    FrmInterv.txtVampire.Text = IntervaloRegeneraVampiro

    'pluto:2.10
    IntervaloUserPuedeTomar = val(GetVar(IniPath & "Server.ini", "INTERVALOS", "IntervaloUserPuedeTomar"))

    IntervaloUserPuedeAtacar = val(GetVar(IniPath & "Server.ini", "INTERVALOS", "IntervaloUserPuedeAtacar"))
    FrmInterv.txtPuedeAtacar.Text = IntervaloUserPuedeAtacar

    frmMain.tLluvia.Interval = val(GetVar(IniPath & "Server.ini", "INTERVALOS", "IntervaloPerdidaStaminaLluvia"))
    FrmInterv.txtIntervaloPerdidaStaminaLluvia.Text = frmMain.tLluvia.Interval

    frmMain.CmdExec.Interval = val(GetVar(IniPath & "Server.ini", "INTERVALOS", "IntervaloTimerExec"))
    FrmInterv.txtCmdExec.Text = frmMain.CmdExec.Interval

    MinutosWs = val(GetVar(IniPath & "Server.ini", "INTERVALOS", "IntervaloWS"))

    If MinutosWs < 60 Then MinutosWs = 180

    IntervaloCerrarConexion = val(GetVar(IniPath & "Server.ini", "INTERVALOS", "IntervaloCerrarConexion"))

    'Ressurect pos
    ResPos.Map = val(ReadField(1, GetVar(IniPath & "Server.ini", "INIT", "ResPos"), 45))
    ResPos.X = val(ReadField(2, GetVar(IniPath & "Server.ini", "INIT", "ResPos"), 45))
    ResPos.Y = val(ReadField(3, GetVar(IniPath & "Server.ini", "INIT", "ResPos"), 45))

    recordusuarios = val(GetVar(IniPath & "Server.ini", "INIT", "Record"))

    'Max users
    MaxUsers = val(GetVar(IniPath & "Server.ini", "INIT", "MaxUsers"))

    'pluto:2.17
    TimeEmbarazo = val(GetVar(IniPath & "Server.ini", "INTERVALOS", "TimeEmbarazo"))
    TimeAborto = val(GetVar(IniPath & "Server.ini", "INTERVALOS", "TimeAborto"))
    ProbEmbarazo = val(GetVar(IniPath & "Server.ini", "INTERVALOS", "ProbEmbarazo"))
    'pluto:6.0A
    NumeroGranPoder = val(GetVar(IniPath & "Server.ini", "INTERVALOS", "NumeroGranPoder"))

    ReDim UserList(1 To MaxUsers) As User
    ReDim Cuentas(1 To MaxUsers)
    Call IniciaCuentas

    Nix.Map = GetVar(DatPath & "Ciudades.dat", "NIX", "Mapa")
    Nix.X = GetVar(DatPath & "Ciudades.dat", "NIX", "X")
    Nix.Y = GetVar(DatPath & "Ciudades.dat", "NIX", "Y")

    Ullathorpe.Map = GetVar(DatPath & "Ciudades.dat", "Ullathorpe", "Mapa")
    Ullathorpe.X = GetVar(DatPath & "Ciudades.dat", "Ullathorpe", "X")
    Ullathorpe.Y = GetVar(DatPath & "Ciudades.dat", "Ullathorpe", "Y")

    Banderbill.Map = GetVar(DatPath & "Ciudades.dat", "Banderbill", "Mapa")
    Banderbill.X = GetVar(DatPath & "Ciudades.dat", "Banderbill", "X")
    Banderbill.Y = GetVar(DatPath & "Ciudades.dat", "Banderbill", "Y")

    Lindos.Map = GetVar(DatPath & "Ciudades.dat", "Lindos", "Mapa")
    Lindos.X = GetVar(DatPath & "Ciudades.dat", "Lindos", "X")
    Lindos.Y = GetVar(DatPath & "Ciudades.dat", "Lindos", "Y")

    ciudadcaos.Map = GetVar(DatPath & "Ciudades.dat", "CAOS", "Mapa")
    ciudadcaos.X = GetVar(DatPath & "Ciudades.dat", "CAOS", "X")
    ciudadcaos.Y = GetVar(DatPath & "Ciudades.dat", "CAOS", "Y")
    'pluto:2.17
    Pobladohumano.Map = GetVar(DatPath & "Ciudades.dat", "humano", "Mapa")
    Pobladohumano.X = GetVar(DatPath & "Ciudades.dat", "humano", "X")
    Pobladohumano.Y = GetVar(DatPath & "Ciudades.dat", "humano", "Y")
    Pobladoorco.Map = GetVar(DatPath & "Ciudades.dat", "orco", "Mapa")
    Pobladoorco.X = GetVar(DatPath & "Ciudades.dat", "orco", "X")
    Pobladoorco.Y = GetVar(DatPath & "Ciudades.dat", "orco", "Y")
    Pobladoenano.Map = GetVar(DatPath & "Ciudades.dat", "enano", "Mapa")
    Pobladoenano.X = GetVar(DatPath & "Ciudades.dat", "enano", "X")
    Pobladoenano.Y = GetVar(DatPath & "Ciudades.dat", "enano", "Y")
    Pobladoelfo.Map = GetVar(DatPath & "Ciudades.dat", "elfo", "Mapa")
    Pobladoelfo.X = GetVar(DatPath & "Ciudades.dat", "elfo", "X")
    Pobladoelfo.Y = GetVar(DatPath & "Ciudades.dat", "elfo", "Y")
    Pobladovampiro.Map = GetVar(DatPath & "Ciudades.dat", "vampiro", "Mapa")
    Pobladovampiro.X = GetVar(DatPath & "Ciudades.dat", "vampiro", "X")
    Pobladovampiro.Y = GetVar(DatPath & "Ciudades.dat", "vampiro", "Y")
    '-------------------------------

    'pluto:2.24------------------------------------
    WeB = GetVar(IniPath & "Server.ini", "INIT", "WebAodraG")
    DifServer = val(GetVar(IniPath & "Server.ini", "INIT", "DificultadServer"))
    DifOro = val(GetVar(IniPath & "Server.ini", "INIT", "DificultadOro"))
    BaseDatos = val(GetVar(IniPath & "Server.ini", "INIT", "BaseDatos"))
    ServerPrimario = val(GetVar(IniPath & "Server.ini", "INIT", "ServerPrimario"))
    NumeroObjEvento = val(GetVar(IniPath & "Server.ini", "EVENTOS", "NumeroObjEvento"))
    CantEntregarObjEvento = val(GetVar(IniPath & "Server.ini", "EVENTOS", "CantEntregarObjEvento"))
    CantObjRecompensa = val(GetVar(IniPath & "Server.ini", "EVENTOS", "CantObjRecompensa"))
    ObjRecompensaEventos(1) = val(GetVar(IniPath & "Server.ini", "EVENTOS", "ObjRecompensaEventos1"))
    ObjRecompensaEventos(2) = val(GetVar(IniPath & "Server.ini", "EVENTOS", "ObjRecompensaEventos2"))
    ObjRecompensaEventos(3) = val(GetVar(IniPath & "Server.ini", "EVENTOS", "ObjRecompensaEventos3"))
    ObjRecompensaEventos(4) = val(GetVar(IniPath & "Server.ini", "EVENTOS", "ObjRecompensaEventos4"))
    '------------------------------------------------

    'Call SQLConnect("localhost", "aodrag", "root", "")
    Call BDDConnect
    'Call BDDResetGMsos
    Call BDDSetUsersOnline

    Call BDDSetCastillos

    Exit Sub
fallo:
    Call LogError("LOADSINI" & Err.number & " D: " & Err.Description)

End Sub

Sub WriteVar(File As String, Main As String, Var As String, value As String)

'*****************************************************************
'Escribe VAR en un archivo
'*****************************************************************
    On Error GoTo fallo

    writeprivateprofilestring Main, Var, value, File
    Exit Sub
fallo:
    Call LogError("WRITEVAR" & Err.number & " D: " & Err.Description)

End Sub

Sub SaveUser(Userindex As Integer, UserFile As String)

    On Error GoTo errhandler

    'pluto:6.2------------------------------------------
    'Posicion de comienzo
    'Dim x As Integer
    'Dim Y As Integer
    'Dim Map As Integer

    'Select Case UserList(UserIndex).Pos.Map

    'Case MAPATORNEO 'torneos
    'If Not Criminal(UserIndex) Then UserList(UserIndex).Pos = Banderbill Else UserList(UserIndex).Pos = ciudadcaos
    'UserList(UserIndex).Pos.Map = 296
    'UserList(UserIndex).Pos.X = 71
    'UserList(UserIndex).Pos.Y = 64
    'Case MapaTorneo2 'torneos
    'If Not Criminal(UserIndex) Then UserList(UserIndex).Pos = Banderbill Else UserList(UserIndex).Pos = ciudadcaos
    'UserList(UserIndex).Pos.Map = 296
    'UserList(UserIndex).Pos.X = 71
    'UserList(UserIndex).Pos.Y = 64
    'Case 291 To 295 'torneos
    'If Not Criminal(UserIndex) Then UserList(UserIndex).Pos = Banderbill Else UserList(UserIndex).Pos = ciudadcaos
    'UserList(UserIndex).Pos.Map = 296
    'UserList(UserIndex).Pos.X = 71
    'UserList(UserIndex).Pos.Y = 64
    'Case 277 'fabrica lingotes
    'If UserList(UserIndex).Pos.X = 36 And UserList(UserIndex).Pos.Y = 70 Then UserList(UserIndex).Pos = Nix

    'Case 186 'fortaleza
    'If fortaleza <> UserList(UserIndex).GuildInfo.GuildName Then
    'If Not Criminal(UserIndex) Then UserList(UserIndex).Pos = Banderbill Else UserList(UserIndex).Pos = ciudadcaos
    'End If

    'Case 166 To 169 'castillos
    'UserList(UserIndex).Pos.X = 26 + RandomNumber(1, 9)
    'UserList(UserIndex).Pos.Y = 85 + RandomNumber(1, 5)

    'Case 191 To 192 'dragfutbol o bloqueo
    'UserList(UserIndex).Pos = Nix

    'End Select
    '---------------------------------

    If FileExist(UserFile, vbNormal) Then
        If UserList(Userindex).flags.Muerto = 1 Then UserList(Userindex).Char.Head = val(GetVar(UserFile, "INIT", _
                                                                                                "Head"))

        '       Kill UserFile
    End If

    'pluto:6.5 quito esto lo llevo a closeuser
    'If UserList(UserIndex).flags.Montura = 1 Then
    'Dim obj As ObjData
    'Call UsaMontura(UserIndex, obj)
    'End If
    Dim loopc As Integer

    Call WriteVar(UserFile, "FLAGS", "Muerto", val(UserList(Userindex).flags.Muerto))
    Call WriteVar(UserFile, "FLAGS", "LiderAlianza", val(UserList(Userindex).flags.LiderAlianza))
    Call WriteVar(UserFile, "FLAGS", "LiderHorda", val(UserList(Userindex).flags.LiderHorda))
    Call WriteVar(UserFile, "FLAGS", "Revisar", val(UserList(Userindex).flags.Revisar))
    Call WriteVar(UserFile, "FLAGS", "Escondido", val(UserList(Userindex).flags.Escondido))
    Call WriteVar(UserFile, "FLAGS", "Hambre", val(UserList(Userindex).flags.Hambre))
    Call WriteVar(UserFile, "FLAGS", "Sed", val(UserList(Userindex).flags.Sed))
    Call WriteVar(UserFile, "FLAGS", "Desnudo", val(UserList(Userindex).flags.Desnudo))
    Call WriteVar(UserFile, "FLAGS", "Ban", val(UserList(Userindex).flags.ban))
    Call WriteVar(UserFile, "FLAGS", "Navegando", val(UserList(Userindex).flags.Navegando))
    'pluto:6.0A---------------
    Call WriteVar(UserFile, "FLAGS", "Minotauro", val(UserList(Userindex).flags.Minotauro))
    'pluto:7.0
    Call WriteVar(UserFile, "FLAGS", "Creditos", val(UserList(Userindex).flags.Creditos))

    Call WriteVar(UserFile, "FLAGS", "DragC1", val(UserList(Userindex).flags.DragCredito1))
    Call WriteVar(UserFile, "FLAGS", "DragC2", val(UserList(Userindex).flags.DragCredito2))
    Call WriteVar(UserFile, "FLAGS", "DragC3", val(UserList(Userindex).flags.DragCredito3))
    Call WriteVar(UserFile, "FLAGS", "DragC4", val(UserList(Userindex).flags.DragCredito4))
    Call WriteVar(UserFile, "FLAGS", "DragC5", val(UserList(Userindex).flags.DragCredito5))
    Call WriteVar(UserFile, "FLAGS", "DragC6", val(UserList(Userindex).flags.DragCredito6))

    Call WriteVar(UserFile, "FLAGS", "Elixir", val(UserList(Userindex).flags.Elixir))
    '--------------------------

    'pluto:2.3
    'Call WriteVar(UserFile, "FLAGS", "Montura", val(UserList(UserIndex).Flags.Montura))
    'Call WriteVar(UserFile, "FLAGS", "ClaseMontura", val(UserList(UserIndex).Flags.ClaseMontura))
    'pluto:2.4.1
    Call WriteVar(UserFile, "FLAGS", "Montura", 0)
    Call WriteVar(UserFile, "FLAGS", "ClaseMontura", 0)

    Call WriteVar(UserFile, "FLAGS", "Envenenado", val(UserList(Userindex).flags.Envenenado))
    Call WriteVar(UserFile, "FLAGS", "Paralizado", val(UserList(Userindex).flags.Paralizado))
    Call WriteVar(UserFile, "FLAGS", "Morph", val(UserList(Userindex).flags.Morph))

    Call WriteVar(UserFile, "FLAGS", "Angel", val(UserList(Userindex).flags.Angel))
    Call WriteVar(UserFile, "FLAGS", "Demonio", val(UserList(Userindex).flags.Demonio))

    Call WriteVar(UserFile, "COUNTERS", "Pena", val(UserList(Userindex).Counters.Pena))

    Call WriteVar(UserFile, "FACCIONES", "Castigo", val(UserList(Userindex).Faccion.Castigo))
    Call WriteVar(UserFile, "FACCIONES", "EjercitoReal", val(UserList(Userindex).Faccion.ArmadaReal))
    Call WriteVar(UserFile, "FACCIONES", "SoyReal", val(UserList(Userindex).Faccion.SoyReal))
    Call WriteVar(UserFile, "FACCIONES", "EjercitoCaos", val(UserList(Userindex).Faccion.FuerzasCaos))
    Call WriteVar(UserFile, "FACCIONES", "SoyCaos", val(UserList(Userindex).Faccion.SoyCaos))
    Call WriteVar(UserFile, "FACCIONES", "CiudMatados", val(UserList(Userindex).Faccion.CiudadanosMatados))
    Call WriteVar(UserFile, "FACCIONES", "NeutMatados", val(UserList(Userindex).Faccion.NeutralesMatados))
    Call WriteVar(UserFile, "FACCIONES", "CrimMatados", val(UserList(Userindex).Faccion.CriminalesMatados))
    Call WriteVar(UserFile, "FACCIONES", "rArCaos", val(UserList(Userindex).Faccion.RecibioArmaduraCaos))
    Call WriteVar(UserFile, "FACCIONES", "rArReal", val(UserList(Userindex).Faccion.RecibioArmaduraReal))
    'pluto:2.3
    Call WriteVar(UserFile, "FACCIONES", "rArLegion", val(UserList(Userindex).Faccion.RecibioArmaduraLegion))
    Call WriteVar(UserFile, "FACCIONES", "rExCaos", val(UserList(Userindex).Faccion.RecibioExpInicialCaos))
    Call WriteVar(UserFile, "FACCIONES", "rExReal", val(UserList(Userindex).Faccion.RecibioExpInicialReal))
    Call WriteVar(UserFile, "FACCIONES", "recCaos", val(UserList(Userindex).Faccion.RecompensasCaos))
    Call WriteVar(UserFile, "FACCIONES", "recReal", val(UserList(Userindex).Faccion.RecompensasReal))

    Call WriteVar(UserFile, "GUILD", "EsGuildLeader", val(UserList(Userindex).GuildInfo.EsGuildLeader))
    Call WriteVar(UserFile, "GUILD", "Echadas", val(UserList(Userindex).GuildInfo.Echadas))
    Call WriteVar(UserFile, "GUILD", "Solicitudes", val(UserList(Userindex).GuildInfo.Solicitudes))
    Call WriteVar(UserFile, "GUILD", "SolicitudesRechazadas", val(UserList(Userindex).GuildInfo.SolicitudesRechazadas))
    Call WriteVar(UserFile, "GUILD", "VecesFueGuildLeader", val(UserList(Userindex).GuildInfo.VecesFueGuildLeader))
    Call WriteVar(UserFile, "GUILD", "YaVoto", val(UserList(Userindex).GuildInfo.YaVoto))
    Call WriteVar(UserFile, "GUILD", "FundoClan", val(UserList(Userindex).GuildInfo.FundoClan))
    'pluto:2.4.5
    Call WriteVar(UserFile, "STATS", "PClan", val(UserList(Userindex).Stats.PClan))
    Call WriteVar(UserFile, "STATS", "GTorneo", val(UserList(Userindex).Stats.GTorneo))

    Call WriteVar(UserFile, "GUILD", "GuildName", UserList(Userindex).GuildInfo.GuildName)
    Call WriteVar(UserFile, "GUILD", "ClanFundado", UserList(Userindex).GuildInfo.ClanFundado)
    Call WriteVar(UserFile, "GUILD", "ClanesParticipo", str(UserList(Userindex).GuildInfo.ClanesParticipo))
    Call WriteVar(UserFile, "GUILD", "GuildPts", str(UserList(Userindex).GuildInfo.GuildPoints))

    '¿Fueron modificados los atributos del usuario?
    If Not UserList(Userindex).flags.TomoPocion Then

        For loopc = 1 To UBound(UserList(Userindex).Stats.UserAtributos)
            Call WriteVar(UserFile, "ATRIBUTOS", "AT" & loopc, val(UserList(Userindex).Stats.UserAtributos(loopc)))
        Next
    Else

        For loopc = 1 To UBound(UserList(Userindex).Stats.UserAtributos)
            UserList(Userindex).Stats.UserAtributos(loopc) = UserList(Userindex).Stats.UserAtributosBackUP(loopc)
            Call WriteVar(UserFile, "ATRIBUTOS", "AT" & loopc, val(UserList(Userindex).Stats.UserAtributos(loopc)))
        Next

    End If

    'pluto:7.0
    Call WriteVar(UserFile, "PORC", "P1", str(UserList(Userindex).UserDañoProyetilesRaza))
    Call WriteVar(UserFile, "PORC", "P2", str(UserList(Userindex).UserDañoArmasRaza))
    Call WriteVar(UserFile, "PORC", "P3", str(UserList(Userindex).UserDañoMagiasRaza))
    Call WriteVar(UserFile, "PORC", "P4", str(UserList(Userindex).UserDefensaMagiasRaza))
    Call WriteVar(UserFile, "PORC", "P5", str(UserList(Userindex).UserEvasiónRaza))
    Call WriteVar(UserFile, "PORC", "P6", str(UserList(Userindex).UserDefensaEscudos))

    For loopc = 1 To UBound(UserList(Userindex).Stats.UserSkills)
        Call WriteVar(UserFile, "SKILLS", "SK" & loopc, val(UserList(Userindex).Stats.UserSkills(loopc)))
    Next

    Call WriteVar(UserFile, "CONTACTO", "Email", UserList(Userindex).Email)
    'pluto:2.10
    Call WriteVar(UserFile, "CONTACTO", "EmailActual", Cuentas(Userindex).mail)
    

    Call WriteVar(UserFile, "INIT", "Genero", UserList(Userindex).Genero)
    Call WriteVar(UserFile, "INIT", "Raza", UserList(Userindex).raza)
    Call WriteVar(UserFile, "INIT", "Hogar", UserList(Userindex).Hogar)
    Call WriteVar(UserFile, "INIT", "Clase", UserList(Userindex).clase)
    Call WriteVar(UserFile, "INIT", "Desc", UserList(Userindex).Desc)
    Call WriteVar(UserFile, "INIT", "Heading", str(UserList(Userindex).Char.Heading))
    Call WriteVar(UserFile, "INIT", "Head", str(UserList(Userindex).OrigChar.Head))

    If UserList(Userindex).flags.Muerto = 0 Then
        Call WriteVar(UserFile, "INIT", "Body", str(UserList(Userindex).Char.Body))

    End If

    If UserList(Userindex).flags.Morph > 0 Then
        Call WriteVar(UserFile, "INIT", "Body", str(UserList(Userindex).flags.Morph))

    End If

    If UserList(Userindex).flags.Angel > 0 Then
        Call WriteVar(UserFile, "INIT", "Body", str(UserList(Userindex).flags.Angel))

    End If

    If UserList(Userindex).flags.Demonio > 0 Then
        Call WriteVar(UserFile, "INIT", "Body", str(UserList(Userindex).flags.Demonio))

    End If

    Call WriteVar(UserFile, "INIT", "Arma", str(UserList(Userindex).Char.WeaponAnim))
    Call WriteVar(UserFile, "INIT", "Escudo", str(UserList(Userindex).Char.ShieldAnim))
    Call WriteVar(UserFile, "INIT", "Casco", str(UserList(Userindex).Char.CascoAnim))
    '[GAU]
    Call WriteVar(UserFile, "INIT", "Botas", str(UserList(Userindex).Char.Botas))
    Call WriteVar(UserFile, "INIT", "Alas", str(UserList(Userindex).Char.AlasAnim))
    '[GAU]
    Call WriteVar(UserFile, "INIT", "RAZAREMORT", UserList(Userindex).Remorted)
    Call WriteVar(UserFile, "INIT", "BD", val(UserList(Userindex).BD))

    Call WriteVar(UserFile, "INIT", "LastIP", UserList(Userindex).ip)
    'pluto:2.14
    Call WriteVar(UserFile, "INIT", "LastSerie", UserList(Userindex).Serie)
    Call WriteVar(UserFile, "INIT", "LastMac", UserList(Userindex).MacPluto)
    Call WriteVar(UserFile, "INIT", "UltimoLogeo", UserList(Userindex).UltimoLogeo)
    Call WriteVar(UserFile, "INIT", "UltimaDenuncia", UserList(Userindex).UltimaDenuncia)
    Call WriteVar(UserFile, "INIT", "PrimeraDenuncia", UserList(Userindex).PrimeraDenuncia)

    'Debug.Print userfile

    'pluto:6.5---------
    'If UserList(UserIndex).Pos.Map = 170 Or UserList(UserIndex).Pos.Map = 34 Then
    'If UserList(UserIndex).Pos.X > 16 And UserList(UserIndex).Pos.X < 31 And UserList(UserIndex).Pos.Y > 42 And UserList(UserIndex).Pos.Y < 48 Then
    'UserList(UserIndex).Pos.X = 36
    'UserList(UserIndex).Pos.Y = 36
    'End If
    'End If
    '------------------
    Call WriteVar(UserFile, "INIT", "Position", UserList(Userindex).Pos.Map & "-" & UserList(Userindex).Pos.X & "-" & _
                                                UserList(Userindex).Pos.Y)

    ' pluto:2.15 -------------------
    Call WriteVar(UserFile, "INIT", "Esposa", UserList(Userindex).Esposa)
    Call WriteVar(UserFile, "INIT", "Nhijos", val(UserList(Userindex).Nhijos))
    Dim X As Byte

    For X = 1 To 5
        Call WriteVar(UserFile, "INIT", "Hijo" & X, UserList(Userindex).Hijo(X))
    Next
    Call WriteVar(UserFile, "INIT", "Amor", val(UserList(Userindex).Amor))
    Call WriteVar(UserFile, "INIT", "Embarazada", val(UserList(Userindex).Embarazada))
    Call WriteVar(UserFile, "INIT", "Bebe", val(UserList(Userindex).Bebe))
    Call WriteVar(UserFile, "INIT", "NombreDelBebe", UserList(Userindex).NombreDelBebe)
    Call WriteVar(UserFile, "INIT", "Padre", UserList(Userindex).Padre)
    Call WriteVar(UserFile, "INIT", "Madre", UserList(Userindex).Madre)
    '-----------------------------------

    'PLUTO:2-3-04
    Call WriteVar(UserFile, "STATS", "PUNTOS", str(UserList(Userindex).Stats.Puntos))

    Call WriteVar(UserFile, "STATS", "GLD", str(UserList(Userindex).Stats.GLD))
    Call WriteVar(UserFile, "STATS", "REMORT", str(UserList(Userindex).Remort))
    Call WriteVar(UserFile, "STATS", "BANCO", str(UserList(Userindex).Stats.Banco))

    Call WriteVar(UserFile, "STATS", "MET", str(UserList(Userindex).Stats.MET))
    Call WriteVar(UserFile, "STATS", "MaxHP", str(UserList(Userindex).Stats.MaxHP))
    Call WriteVar(UserFile, "STATS", "MinHP", str(UserList(Userindex).Stats.MinHP))

    Call WriteVar(UserFile, "STATS", "FIT", str(UserList(Userindex).Stats.FIT))
    Call WriteVar(UserFile, "STATS", "MaxSTA", str(UserList(Userindex).Stats.MaxSta))
    Call WriteVar(UserFile, "STATS", "MinSTA", str(UserList(Userindex).Stats.MinSta))

    Call WriteVar(UserFile, "STATS", "MaxMAN", str(UserList(Userindex).Stats.MaxMAN))
    Call WriteVar(UserFile, "STATS", "MinMAN", str(UserList(Userindex).Stats.MinMAN))

    Call WriteVar(UserFile, "STATS", "MaxHIT", str(UserList(Userindex).Stats.MaxHIT))
    Call WriteVar(UserFile, "STATS", "MinHIT", str(UserList(Userindex).Stats.MinHIT))

    Call WriteVar(UserFile, "STATS", "MaxAGU", str(UserList(Userindex).Stats.MaxAGU))
    Call WriteVar(UserFile, "STATS", "MinAGU", str(UserList(Userindex).Stats.MinAGU))

    Call WriteVar(UserFile, "STATS", "MaxHAM", str(UserList(Userindex).Stats.MaxHam))
    Call WriteVar(UserFile, "STATS", "MinHAM", str(UserList(Userindex).Stats.MinHam))

    Call WriteVar(UserFile, "STATS", "SkillPtsLibres", str(UserList(Userindex).Stats.SkillPts))

    Call WriteVar(UserFile, "STATS", "EXP", str(UserList(Userindex).Stats.exp))
    Call WriteVar(UserFile, "STATS", "ELV", str(UserList(Userindex).Stats.ELV))
    Call WriteVar(UserFile, "STATS", "ELU", str(UserList(Userindex).Stats.Elu))
    Call WriteVar(UserFile, "STATS", "ELO", str(UserList(Userindex).Stats.Elo))
    
    'pluto:6.0A
    Call WriteVar(UserFile, "STATS", "LIBROSUSADOS", str(UserList(Userindex).Stats.LibrosUsados))
    Call WriteVar(UserFile, "STATS", "FAMA", str(UserList(Userindex).Stats.Fama))

    Call WriteVar(UserFile, "MUERTES", "UserMuertes", val(UserList(Userindex).Stats.UsuariosMatados))
    Call WriteVar(UserFile, "MUERTES", "CrimMuertes", val(UserList(Userindex).Stats.CriminalesMatados))
    Call WriteVar(UserFile, "MUERTES", "NpcsMuertes", val(UserList(Userindex).Stats.NPCsMuertos))

    '[KEVIN]----------------------------------------------------------------------------
    '*******************************************************************************************

    'pluto:7.0 quito esto que pasa a sistema cuentas
    'Call WriteVar(userfile, "BancoInventory", "CantidadItems", val(UserList(UserIndex).BancoInvent.NroItems))
    'Dim loopd As Integer
    'pluto:7.0
    'For loopd = 1 To MAX_BANCOINVENTORY_SLOTS
    '   Call WriteVar(userfile, "BancoInventory", "Obj" & loopd, UserList(UserIndex).BancoInvent.Object(loopd).ObjIndex & "-" & UserList(UserIndex).BancoInvent.Object(loopd).Amount)
    'Next loopd
    '*******************************************************************************************
    '[/KEVIN]-----------

    'Save Inv
    Call WriteVar(UserFile, "Inventory", "CantidadItems", val(UserList(Userindex).Invent.NroItems))

    For loopc = 1 To MAX_INVENTORY_SLOTS
        Call WriteVar(UserFile, "Inventory", "Obj" & loopc, UserList(Userindex).Invent.Object(loopc).ObjIndex & "-" & _
                                                            UserList(Userindex).Invent.Object(loopc).Amount & "-" & UserList(Userindex).Invent.Object( _
                                                            loopc).Equipped)
    Next

    Call WriteVar(UserFile, "Inventory", "WeaponEqpSlot", str(UserList(Userindex).Invent.WeaponEqpSlot))
    Call WriteVar(UserFile, "Inventory", "ArmourEqpSlot", str(UserList(Userindex).Invent.ArmourEqpSlot))
    Call WriteVar(UserFile, "Inventory", "CascoEqpSlot", str(UserList(Userindex).Invent.CascoEqpSlot))
    Call WriteVar(UserFile, "Inventory", "EscudoEqpSlot", str(UserList(Userindex).Invent.EscudoEqpSlot))
    Call WriteVar(UserFile, "Inventory", "BarcoSlot", str(UserList(Userindex).Invent.BarcoSlot))
    Call WriteVar(UserFile, "Inventory", "MunicionSlot", str(UserList(Userindex).Invent.MunicionEqpSlot))
    'pluto:2.4.1
    Call WriteVar(UserFile, "Inventory", "AnilloEqpSlot", str(UserList(Userindex).Invent.AnilloEqpSlot))

    '[GAU]
    Call WriteVar(UserFile, "Inventory", "BotaEqpSlot", str(UserList(Userindex).Invent.BotaEqpSlot))
    Call WriteVar(UserFile, "Inventory", "AlaEqpSlot", str(UserList(Userindex).Invent.AlaEqpSlot))
    '[GAU]

    'Reputacion
    Call WriteVar(UserFile, "REP", "Asesino", val(UserList(Userindex).Reputacion.AsesinoRep))
    Call WriteVar(UserFile, "REP", "Bandido", val(UserList(Userindex).Reputacion.BandidoRep))
    Call WriteVar(UserFile, "REP", "Burguesia", val(UserList(Userindex).Reputacion.BurguesRep))
    Call WriteVar(UserFile, "REP", "Ladrones", val(UserList(Userindex).Reputacion.LadronesRep))
    Call WriteVar(UserFile, "REP", "Nobles", val(UserList(Userindex).Reputacion.NobleRep))
    Call WriteVar(UserFile, "REP", "Plebe", val(UserList(Userindex).Reputacion.PlebeRep))

    Dim l As Long
    l = (-UserList(Userindex).Reputacion.AsesinoRep) + (-UserList(Userindex).Reputacion.BandidoRep) + UserList( _
        Userindex).Reputacion.BurguesRep + (-UserList(Userindex).Reputacion.LadronesRep) + UserList( _
        Userindex).Reputacion.NobleRep + UserList(Userindex).Reputacion.PlebeRep
    l = l / 6
    Call WriteVar(UserFile, "REP", "Promedio", val(l))

    Dim cad As String

    For loopc = 1 To MAXUSERHECHIZOS
        cad = UserList(Userindex).Stats.UserHechizos(loopc)
        Call WriteVar(UserFile, "HECHIZOS", "H" & loopc, cad)
    Next

    Call SaveQuestStats(Userindex, UserFile)

    For loopc = 1 To MAXMASCOTAS

        ' Mascota valida?
        If UserList(Userindex).MascotasIndex(loopc) > 0 Then

            ' Nos aseguramos que la criatura no fue invocada
            If Npclist(UserList(Userindex).MascotasIndex(loopc)).Contadores.TiempoExistencia = 0 Then
                cad = UserList(Userindex).MascotasType(loopc)
            Else    'Si fue invocada no la guardamos
                cad = "0"
                UserList(Userindex).NroMacotas = UserList(Userindex).NroMacotas - 1

            End If

            Call WriteVar(UserFile, "MASCOTAS", "MAS" & loopc, 0)

        End If

    Next

    Call WriteVar(UserFile, "MASCOTAS", "NroMascotas", 0)

    'pluto:6.0A -guardamos mascotas
    Call WriteVar(UserFile, "MONTURAS", "NroMonturas", val(UserList(Userindex).Nmonturas))

    loopc = 0
    Dim n As Byte

    For n = 1 To 12

        loopc = UserList(Userindex).Montura.index(n)

        If loopc > 0 Then
            Call WriteVar(UserFile, "MONTURA" & loopc, "TIPO", val(UserList(Userindex).Montura.Tipo(n)))

            Call WriteVar(UserFile, "MONTURA" & loopc, "NIVEL", val(UserList(Userindex).Montura.Nivel(n)))
            Call WriteVar(UserFile, "MONTURA" & loopc, "EXP", val(UserList(Userindex).Montura.exp(n)))
            Call WriteVar(UserFile, "MONTURA" & loopc, "ELU", val(UserList(Userindex).Montura.Elu(n)))
            Call WriteVar(UserFile, "MONTURA" & loopc, "VIDA", val(UserList(Userindex).Montura.Vida(n)))
            Call WriteVar(UserFile, "MONTURA" & loopc, "GOLPE", val(UserList(Userindex).Montura.Golpe(n)))
            Call WriteVar(UserFile, "MONTURA" & loopc, "NOMBRE", UserList(Userindex).Montura.Nombre(n))

            Call WriteVar(UserFile, "MONTURA" & loopc, "ATCUERPO", val(UserList(Userindex).Montura.AtCuerpo(n)))
            Call WriteVar(UserFile, "MONTURA" & loopc, "DEFCUERPO", val(UserList(Userindex).Montura.Defcuerpo(n)))
            Call WriteVar(UserFile, "MONTURA" & loopc, "ATFLECHAS", val(UserList(Userindex).Montura.AtFlechas(n)))
            Call WriteVar(UserFile, "MONTURA" & loopc, "DEFFLECHAS", val(UserList(Userindex).Montura.DefFlechas(n)))
            Call WriteVar(UserFile, "MONTURA" & loopc, "ATMAGICO", val(UserList(Userindex).Montura.AtMagico(n)))
            Call WriteVar(UserFile, "MONTURA" & loopc, "DEFMAGICO", val(UserList(Userindex).Montura.DefMagico(n)))
            Call WriteVar(UserFile, "MONTURA" & loopc, "EVASION", val(UserList(Userindex).Montura.Evasion(n)))
            Call WriteVar(UserFile, "MONTURA" & loopc, "LIBRES", val(UserList(Userindex).Montura.Libres(n)))

        End If

    Next

    'Delzak sistema premios
    For n = 1 To 34
        Call WriteVar(UserFile, "PREMIOS", "L" & n, val(UserList(Userindex).Stats.PremioNPC(n)))
    Next

    Exit Sub
errhandler:
    Call LogError("Error en SaveUser")

End Sub

Function Criminal(ByVal Userindex As Integer) As Boolean

    On Error GoTo fallo

    'Dim a As Integer
    'If UserList(UserIndex).Reputacion.Promedio < 0 Then a = 1 Else a = 0
    'Dim l As Long
    'l = (-UserList(Userindex).Reputacion.AsesinoRep) + (-UserList(Userindex).Reputacion.BandidoRep) + UserList( _
     '   Userindex).Reputacion.BurguesRep + (-UserList(Userindex).Reputacion.LadronesRep) + UserList( _
      '  Userindex).Reputacion.NobleRep + UserList(Userindex).Reputacion.PlebeRep
    'l = l / 6
    'Criminal = (l < 0)
    'UserList(Userindex).Reputacion.Promedio = l
    If UserList(Userindex).Faccion.FuerzasCaos = 1 Then
    Criminal = True
    Else
    Criminal = False
    End If
    'If a = 0 And Criminal = True Then UserCrimi = UserCrimi + 1: UserCiu = UserCiu - 1
    'If a = 1 And Criminal = False Then UserCiu = UserCiu + 1: UserCrimi = UserCrimi - 1
    Exit Function
fallo:
    Call LogError("CRIMINAL " & Err.number & " D: " & Err.Description)

End Function

Sub BackUPnPc(NpcIndex As Integer)

    On Error GoTo fallo

    'Call LogTarea("Sub BackUPnPc NpcIndex:" & NpcIndex)

    Dim NpcNumero As Integer
    Dim npcfile As String
    Dim loopc As Integer

    NpcNumero = Npclist(NpcIndex).numero

    If NpcNumero > 499 Then
        npcfile = DatPath & "bkNPCs-HOSTILES.dat"
    Else
        npcfile = DatPath & "bkNPCs.dat"

    End If

    'General
    Call WriteVar(npcfile, "NPC" & NpcNumero, "Name", Npclist(NpcIndex).Name)

    Call WriteVar(npcfile, "NPC" & NpcNumero, "Desc", Npclist(NpcIndex).Desc)
    Call WriteVar(npcfile, "NPC" & NpcNumero, "Head", val(Npclist(NpcIndex).Char.Head))
    Call WriteVar(npcfile, "NPC" & NpcNumero, "Body", val(Npclist(NpcIndex).Char.Body))
    Call WriteVar(npcfile, "NPC" & NpcNumero, "Heading", val(Npclist(NpcIndex).Char.Heading))
    Call WriteVar(npcfile, "NPC" & NpcNumero, "Movement", val(Npclist(NpcIndex).Movement))
    Call WriteVar(npcfile, "NPC" & NpcNumero, "Attackable", val(Npclist(NpcIndex).Attackable))
    Call WriteVar(npcfile, "NPC" & NpcNumero, "Comercia", val(Npclist(NpcIndex).Comercia))
    Call WriteVar(npcfile, "NPC" & NpcNumero, "TipoItems", val(Npclist(NpcIndex).TipoItems))
    Call WriteVar(npcfile, "NPC" & NpcNumero, "Hostil", val(Npclist(NpcIndex).Hostile))
    Call WriteVar(npcfile, "NPC" & NpcNumero, "GiveEXP", val(Npclist(NpcIndex).GiveEXP))
    Call WriteVar(npcfile, "NPC" & NpcNumero, "GiveGLD", val(Npclist(NpcIndex).GiveGLD))
    Call WriteVar(npcfile, "NPC" & NpcNumero, "Hostil", val(Npclist(NpcIndex).Hostile))
    Call WriteVar(npcfile, "NPC" & NpcNumero, "Inflacion", val(Npclist(NpcIndex).Inflacion))
    Call WriteVar(npcfile, "NPC" & NpcNumero, "InvReSpawn", val(Npclist(NpcIndex).InvReSpawn))
    Call WriteVar(npcfile, "NPC" & NpcNumero, "NpcType", val(Npclist(NpcIndex).NPCtype))
    'pluto:6.0A
    Call WriteVar(npcfile, "NPC" & NpcNumero, "Arquero", val(Npclist(NpcIndex).Arquero))
    Call WriteVar(npcfile, "NPC" & NpcNumero, "Anima", val(Npclist(NpcIndex).Anima))
    Call WriteVar(npcfile, "NPC" & NpcNumero, "Raid", val(Npclist(NpcIndex).Raid))
    'pluto:7.0
    Call WriteVar(npcfile, "NPC" & NpcNumero, "LogroTipo", val(Npclist(NpcIndex).LogroTipo))

    'Stats
    Call WriteVar(npcfile, "NPC" & NpcNumero, "Alineacion", val(Npclist(NpcIndex).Stats.Alineacion))
    Call WriteVar(npcfile, "NPC" & NpcNumero, "DEF", val(Npclist(NpcIndex).Stats.Def))
    Call WriteVar(npcfile, "NPC" & NpcNumero, "MaxHit", val(Npclist(NpcIndex).Stats.MaxHIT))
    Call WriteVar(npcfile, "NPC" & NpcNumero, "MaxHp", val(Npclist(NpcIndex).Stats.MaxHP))
    Call WriteVar(npcfile, "NPC" & NpcNumero, "MinHit", val(Npclist(NpcIndex).Stats.MinHIT))
    Call WriteVar(npcfile, "NPC" & NpcNumero, "MinHp", val(Npclist(NpcIndex).Stats.MinHP))
    Call WriteVar(npcfile, "NPC" & NpcNumero, "DEF", val(Npclist(NpcIndex).Stats.UsuariosMatados))

    'Flags
    Call WriteVar(npcfile, "NPC" & NpcNumero, "ReSpawn", val(Npclist(NpcIndex).flags.Respawn))
    Call WriteVar(npcfile, "NPC" & NpcNumero, "BackUp", val(Npclist(NpcIndex).flags.BackUp))
    Call WriteVar(npcfile, "NPC" & NpcNumero, "Domable", val(Npclist(NpcIndex).flags.Domable))

    'Inventario
    Call WriteVar(npcfile, "NPC" & NpcNumero, "NroItems", val(Npclist(NpcIndex).Invent.NroItems))

    If Npclist(NpcIndex).Invent.NroItems > 0 Then

        For loopc = 1 To MAX_INVENTORY_SLOTS
            Call WriteVar(npcfile, "NPC" & NpcNumero, "Obj" & loopc, Npclist(NpcIndex).Invent.Object(loopc).ObjIndex _
                                                                     & "-" & Npclist(NpcIndex).Invent.Object(loopc).Amount)
        Next

    End If

    Exit Sub
fallo:
    Call LogError("BACKUPNPC" & Err.number & " D: " & Err.Description)

End Sub

Sub CargarNpcBackUp(NpcIndex As Integer, ByVal NpcNumber As Integer)

'eze
    On Local Error Resume Next
    'eze

    On Error GoTo fallo

    'Call LogTarea("Sub CargarNpcBackUp NpcIndex:" & NpcIndex & " NpcNumber:" & NpcNumber)

    'Status
    If frmMain.Visible Then frmMain.txStatus.Caption = "Cargando backup Npc"

    Dim npcfile As String

    If NpcNumber > 499 Then
        npcfile = DatPath & "bkNPCs-HOSTILES.dat"
    Else
        npcfile = DatPath & "bkNPCs.dat"

    End If

    Npclist(NpcIndex).numero = NpcNumber
    'pluto:2.17
    Npclist(NpcIndex).Anima = val(GetVar(npcfile, "NPC" & NpcNumber, "Anima"))
    Npclist(NpcIndex).Name = GetVar(npcfile, "NPC" & NpcNumber, "Name")
    Npclist(NpcIndex).Desc = GetVar(npcfile, "NPC" & NpcNumber, "Desc")
    Npclist(NpcIndex).Movement = val(GetVar(npcfile, "NPC" & NpcNumber, "Movement"))
    Npclist(NpcIndex).NPCtype = val(GetVar(npcfile, "NPC" & NpcNumber, "NpcType"))
    'pluto:6.0A
    Npclist(NpcIndex).Arquero = val(GetVar(npcfile, "NPC" & NpcNumber, "Arquero"))
    Npclist(NpcIndex).Raid = val(GetVar(npcfile, "NPC" & NpcNumber, "Raid"))
    'pluto:7.0
    Npclist(NpcIndex).LogroTipo = val(GetVar(npcfile, "NPC" & NpcNumber, "LogroTipo"))

    Npclist(NpcIndex).Char.Body = val(GetVar(npcfile, "NPC" & NpcNumber, "Body"))
    'EZE
    Npclist(NpcIndex).Char.ShieldAnim = val(GetVar(npcfile, "NPC" & NpcNumber, "EscudoAnim"))
    Npclist(NpcIndex).Char.WeaponAnim = val(GetVar(npcfile, "NPC" & NpcNumber, "ArmaAnim"))
    Npclist(NpcIndex).Char.CascoAnim = val(GetVar(npcfile, "NPC" & NpcNumber, "CascoAnim"))
    'EZE
    Npclist(NpcIndex).Char.Head = val(GetVar(npcfile, "NPC" & NpcNumber, "Head"))
    Npclist(NpcIndex).Char.Heading = val(GetVar(npcfile, "NPC" & NpcNumber, "Heading"))
    Npclist(NpcIndex).Attackable = val(GetVar(npcfile, "NPC" & NpcNumber, "Attackable"))
    Npclist(NpcIndex).Comercia = val(GetVar(npcfile, "NPC" & NpcNumber, "Comercia"))
    Npclist(NpcIndex).Hostile = val(GetVar(npcfile, "NPC" & NpcNumber, "Hostile"))
    Npclist(NpcIndex).GiveEXP = val(GetVar(npcfile, "NPC" & NpcNumber, "GiveEXP"))

    Npclist(NpcIndex).GiveGLD = val(GetVar(npcfile, "NPC" & NpcNumber, "GiveGLD"))
    Npclist(NpcIndex).QuestNumber = val(GetVar(npcfile, "NPC" & NpcNumber, "QuestNumber"))

    Npclist(NpcIndex).InvReSpawn = val(GetVar(npcfile, "NPC" & NpcNumber, "InvReSpawn"))

    '@Nati: NPCS vida a 1
    'Npclist(NpcIndex).Stats.MaxHP = 1
    'Npclist(NpcIndex).Stats.MinHP = 1
    Npclist(NpcIndex).Stats.MaxHP = val(GetVar(npcfile, "NPC" & NpcNumber, "MaxHP"))
    Npclist(NpcIndex).Stats.MinHP = val(GetVar(npcfile, "NPC" & NpcNumber, "MinHP"))
    Npclist(NpcIndex).Stats.MaxHIT = val(GetVar(npcfile, "NPC" & NpcNumber, "MaxHIT"))
    Npclist(NpcIndex).Stats.MinHIT = val(GetVar(npcfile, "NPC" & NpcNumber, "MinHIT"))
    Npclist(NpcIndex).Stats.Def = val(GetVar(npcfile, "NPC" & NpcNumber, "DEF"))
    Npclist(NpcIndex).Stats.Alineacion = val(GetVar(npcfile, "NPC" & NpcNumber, "Alineacion"))
    Npclist(NpcIndex).Stats.ImpactRate = val(GetVar(npcfile, "NPC" & NpcNumber, "ImpactRate"))
    'Npclist(NpcIndex).Premio = val(GetVar(npcfile, "NPC" & NpcNumber, "Premio")) 'Delzak sistema premios

    Dim loopc As Integer
    Dim ln As String
    Npclist(NpcIndex).Invent.NroItems = val(GetVar(npcfile, "NPC" & NpcNumber, "NROITEMS"))

    If Npclist(NpcIndex).Invent.NroItems > 0 Then

        For loopc = 1 To MAX_INVENTORY_SLOTS
            ln = GetVar(npcfile, "NPC" & NpcNumber, "Obj" & loopc)
            Npclist(NpcIndex).Invent.Object(loopc).ObjIndex = val(ReadField(1, ln, 45))
            Npclist(NpcIndex).Invent.Object(loopc).Amount = val(ReadField(2, ln, 45))

        Next loopc

    Else

        For loopc = 1 To MAX_INVENTORY_SLOTS
            Npclist(NpcIndex).Invent.Object(loopc).ObjIndex = 0
            Npclist(NpcIndex).Invent.Object(loopc).Amount = 0
        Next loopc

    End If

    Npclist(NpcIndex).Inflacion = val(GetVar(npcfile, "NPC" & NpcNumber, "Inflacion"))

    Npclist(NpcIndex).flags.NPCActive = True
    Npclist(NpcIndex).flags.UseAINow = False
    Npclist(NpcIndex).flags.Respawn = val(GetVar(npcfile, "NPC" & NpcNumber, "ReSpawn"))
    Npclist(NpcIndex).flags.BackUp = val(GetVar(npcfile, "NPC" & NpcNumber, "BackUp"))
    Npclist(NpcIndex).flags.Domable = val(GetVar(npcfile, "NPC" & NpcNumber, "Domable"))
    Npclist(NpcIndex).flags.RespawnOrigPos = val(GetVar(npcfile, "NPC" & NpcNumber, "PosOrig"))

    'Tipo de items con los que comercia
    Npclist(NpcIndex).TipoItems = val(GetVar(npcfile, "NPC" & NpcNumber, "TipoItems"))
    Exit Sub
fallo:
    Call LogError("CARGARNPCBACKUP" & Err.number & " D: " & Err.Description)

End Sub

Sub LogBan(ByVal BannedIndex As Integer, _
           ByVal Userindex As Integer, _
           ByVal moTivo As String)

    On Error GoTo fallo

    Call WriteVar(App.Path & "\logs\" & "BanDetail.dat", UserList(BannedIndex).Name, "BannedBy", UserList( _
                                                                                                 Userindex).Name)
    Call WriteVar(App.Path & "\logs\" & "BanDetail.dat", UserList(BannedIndex).Name, "Reason", moTivo)
    Call WriteVar(App.Path & "\logs\" & "BanDetail.dat", UserList(BannedIndex).Name, "Fecha", Date)

    'Log interno del servidor, lo usa para hacer un UNBAN general de toda la gente banned
    Dim mifile As Integer
    mifile = FreeFile
    Open App.Path & "\logs\GenteBanned.log" For Append Shared As #mifile
    Print #mifile, UserList(BannedIndex).Name
    Close #mifile
    Exit Sub
fallo:
    Call LogError("LOGBAN" & Err.number & " D: " & Err.Description)

End Sub

Private Sub BuscaPosicionValida(Userindex As Integer)

'Delzak (28-8-10)

    Dim leer As New clsIniManager
    Dim Mapa As Integer
    Dim X As Integer
    Dim Y As Integer
    Dim MapaOK As Integer
    Dim XOK As Integer
    Dim YOK As Integer
    Dim dn As Integer
    Dim M As Integer
    Dim User As Integer
    Dim iNDiCe As Integer
    Dim QueSumo As Boolean    '0 para x, 1 para y
    Dim PosicionValida As Boolean
    Dim ControlBordes As Boolean

    Mapa = UserList(Userindex).Pos.Map
    X = UserList(Userindex).Pos.X
    Y = UserList(Userindex).Pos.Y
    MapaOK = Mapa
    XOK = X
    YOK = Y
    QueSumo = False
    iNDiCe = 1
    ControlBordes = True

    'Busco un hueco donde no haya nadie y que no este bloqueado (OPTIMIZADO 14-9-10)

    For dn = 1 To 6400    '80x80

        PosicionValida = True

        'Compruebo que no haya nadie en la posicion que quiero logear
        For User = 1 To LastUser

            If UserList(User).Pos.Map = MapaOK And UserList(User).Pos.X = XOK And UserList(User).Pos.Y = YOK Then _
               PosicionValida = False
        Next

        'Compruebo que no este bloqueado
        If PosicionValida = True Then

            If MapData(MapaOK, XOK, YOK).Blocked = 1 Then PosicionValida = False

        End If

        'Si la posicion es valida, salgo del bucle
        If PosicionValida = True And ControlBordes = True Then Exit For

        'Si no es valida, busco una trazando un espiral

        If QueSumo = False Then

            XOK = XOK + iNDiCe

        Else

            YOK = YOK + iNDiCe

            iNDiCe = iNDiCe * (-1)

            If iNDiCe < 0 Then iNDiCe = iNDiCe - 1
            If iNDiCe > 0 Then iNDiCe = iNDiCe + 1

        End If

        If QueSumo = True Then QueSumo = False
        If QueSumo = False Then QueSumo = True

        'Controlo que no me salga del borde
        If XOK < 4 Or XOK > 85 Or YOK < 4 Or YOK > 85 Then ControlBordes = False Else ControlBordes = True

        'Si termina el bucle y no he encontrado alternativa, que le den por culo
        If dn = 6400 Then
            MapaOK = Mapa
            XOK = X
            YOK = Y

        End If

    Next

    'Bloqueo la posicion donde voy a aparecer para que no me de por culo nadie
    MapData(MapaOK, XOK, YOK).Blocked = 1

    'Cargo mi posicion
    UserList(Userindex).Pos.Map = MapaOK
    UserList(Userindex).Pos.X = XOK
    UserList(Userindex).Pos.Y = YOK

    'Desbloqueo la posicion
    MapData(MapaOK, XOK, YOK).Blocked = 0

End Sub
