Attribute VB_Name = "mod_NewMap"
Option Explicit

Function FileExist(ByVal File As String, _
                   Optional FileType As VbFileAttribute = vbNormal) As Boolean
'*****************************************************************
'Se fija si existe el archivo
'*****************************************************************

    FileExist = LenB(Dir$(File, FileType)) <> 0

End Function

Sub LoadMapData()

    '***************************************************
    'Author: Unknown
    'Last Modification: -
    '
    '***************************************************

    If frmMain.Visible Then frmMain.txStatus.Caption = "Cargando mapas..."

    Dim Map       As Integer
    Dim tFileName As String

    On Error GoTo man

    NumMaps = val(GetVar(DatPath & "Map.dat", "INIT", "NumMaps"))

    frmCargando.cargar.min = 0
    frmCargando.cargar.max = NumMaps
    frmCargando.cargar.Value = 0

    MapPath = GetVar(DatPath & "Map.dat", "INIT", "MapPath")

    ReDim MapData(1 To NumMaps, XMinMapSize To XMaxMapSize, YMinMapSize To YMaxMapSize) As MapBlock
    ReDim MapInfo(1 To NumMaps) As MapInfo

    For Map = 1 To NumMaps
        
        tFileName = App.Path & MapPath & "Mapa" & Map
        Call CargarMapa(Map, tFileName)

        frmCargando.cargar.Value = frmCargando.cargar.Value + 1
        DoEvents
    Next Map

    Exit Sub

man:
    MsgBox ("Error durante la carga de mapas, el mapa " & Map & " contiene errores")
    Call LogError(Date & " " & Err.Description & " " & Err.HelpContext & " " & Err.HelpFile & " " & Err.source)

End Sub

Sub CargarBackUp()

    '***************************************************
    'Author: Unknown
    'Last Modification: -
    '
    '***************************************************

    If frmMain.Visible Then frmMain.txStatus.Caption = "Cargando backup."

    Dim Map       As Integer
    Dim tFileName As String

    On Error GoTo man

    NumMaps = val(GetVar(DatPath & "Map.dat", "INIT", "NumMaps"))

    frmCargando.cargar.min = 0
    frmCargando.cargar.max = NumMaps
    frmCargando.cargar.Value = 0

    MapPath = GetVar(DatPath & "Map.dat", "INIT", "MapPath")

    ReDim MapData(1 To NumMaps, XMinMapSize To XMaxMapSize, YMinMapSize To YMaxMapSize) As MapBlock
    ReDim MapInfo(1 To NumMaps) As MapInfo

    For Map = 1 To NumMaps

        If val(GetVar(App.Path & MapPath & "Mapa" & Map & ".Dat", "Mapa" & Map, "BackUp")) <> 0 Then
            tFileName = App.Path & "\WorldBackUp\Mapa" & Map

            If Not FileExist(tFileName & ".*") Then    'Miramos que exista al menos uno de los 3 archivos, sino lo cargamos de la carpeta de los mapas
                tFileName = App.Path & MapPath & "Mapa" & Map

            End If

        Else
            tFileName = App.Path & MapPath & "Mapa" & Map

        End If

        Call CargarMapa(Map, tFileName)

        frmCargando.cargar.Value = frmCargando.cargar.Value + 1
        DoEvents
    Next Map

    Exit Sub

man:
    MsgBox ("Error durante la carga de mapas, el mapa " & Map & " contiene errores")
    Call LogError(Date & " " & Err.Description & " " & Err.HelpContext & " " & Err.HelpFile & " " & Err.source)

End Sub

Public Sub CargarMapa(ByVal Map As Long, ByRef MAPFl As String)
'***************************************************
'Author: Unknown
'Last Modification: 10/08/2010
'10/08/2010 - Pato: Implemento el clsByteBuffer y el clsIniManager para la carga de mapa
'***************************************************

    On Error GoTo errh

    Dim hFile As Integer
    Dim X As Long
    Dim Y As Long
    Dim ByFlags As Byte
    Dim npcfile As String
    Dim leer As clsIniManager
    Dim MapReader As clsByteBuffer
    Dim InfReader As clsByteBuffer
    Dim Buff() As Byte

    Set MapReader = New clsByteBuffer
    Set InfReader = New clsByteBuffer
    Set leer = New clsIniManager

    npcfile = DatPath & "NPCs.dat"

    hFile = FreeFile

    Open MAPFl & ".Map" For Binary As #hFile
    Seek hFile, 1

    ReDim Buff(LOF(hFile) - 1) As Byte

    Get #hFile, , Buff
    Close hFile

    Call MapReader.initializeReader(Buff)

    'inf
    Open MAPFl & ".inf" For Binary As #hFile
    Seek hFile, 1

    ReDim Buff(LOF(hFile) - 1) As Byte

    Get #hFile, , Buff
    Close hFile

    Call InfReader.initializeReader(Buff)

    'map Header
    MapInfo(Map).MapVersion = MapReader.getInteger

    MiCabecera.Desc = MapReader.getString(Len(MiCabecera.Desc))
    MiCabecera.crc = MapReader.getLong
    MiCabecera.MagicWord = MapReader.getLong

    Call MapReader.getDouble

    'inf Header
    Call InfReader.getDouble
    Call InfReader.getInteger

    For Y = YMinMapSize To YMaxMapSize
        For X = XMinMapSize To XMaxMapSize

            With MapData(Map, X, Y)
                '.map file
                ByFlags = MapReader.getByte

                If ByFlags And 1 Then .Blocked = 1

                .Graphic(1) = MapReader.getLong

                'Layer 2 used?
                If ByFlags And 2 Then .Graphic(2) = MapReader.getLong

                'Layer 3 used?
                If ByFlags And 4 Then .Graphic(3) = MapReader.getLong

                'Layer 4 used?
                If ByFlags And 8 Then .Graphic(4) = MapReader.getLong

                'Trigger used?
                If ByFlags And 16 Then .trigger = MapReader.getInteger

                '.inf file
                ByFlags = InfReader.getByte

                If ByFlags And 1 Then
                    .TileExit.Map = InfReader.getInteger
                    .TileExit.X = InfReader.getInteger
                    .TileExit.Y = InfReader.getInteger

                End If

                If ByFlags And 2 Then
                    'Get and make NPC
                    .NpcIndex = InfReader.getInteger

                    If .NpcIndex > 0 Then

                        If .NpcIndex > 499 Then
                            npcfile = DatPath & "NPCs-HOSTILES.dat"
                            'quitar esto----------------------------
                            'Dim NpcUsado(1 To 1000) As String
                            ' NpcUsado(MapData(Map, X, Y).NpcIndex) = NpcUsado(MapData(Map, X, Y).NpcIndex) & Map & ","
                            '-----------------------------------------
                        Else
                            npcfile = DatPath & "NPCs.dat"

                        End If

                        'Si el npc debe hacer respawn en la pos
                        'original la guardamos
                        If val(GetVar(npcfile, "NPC" & .NpcIndex, "PosOrig")) = 1 Then
                            .NpcIndex = OpenNPC(.NpcIndex)
                            Npclist(.NpcIndex).Orig.Map = Map
                            Npclist(.NpcIndex).Orig.X = X
                            Npclist(.NpcIndex).Orig.Y = Y
                        Else
                            .NpcIndex = OpenNPC(.NpcIndex)

                        End If

                        Npclist(.NpcIndex).Pos.Map = Map
                        Npclist(.NpcIndex).Pos.X = X
                        Npclist(.NpcIndex).Pos.Y = Y

                        Call MakeNPCChar(ToNone, 0, 0, .NpcIndex, Map, X, Y)

                    End If

                End If

                If ByFlags And 4 Then
                    'Get and make Object
                    .OBJInfo.ObjIndex = InfReader.getInteger
                    .OBJInfo.Amount = InfReader.getInteger

                End If

            End With

        Next X
    Next Y

    Call leer.Initialize(MAPFl & ".dat")

    With MapInfo(Map)
        .Name = leer.GetValue("Mapa" & Map, "Name")
        .Music = leer.GetValue("Mapa" & Map, "MusicNum")
        .StartPos.Map = val(ReadField(1, leer.GetValue("Mapa" & Map, "StartPos"), Asc("-")))
        .StartPos.X = val(ReadField(2, leer.GetValue("Mapa" & Map, "StartPos"), Asc("-")))
        .StartPos.Y = val(ReadField(3, leer.GetValue("Mapa" & Map, "StartPos"), Asc("-")))

        If val(leer.GetValue("Mapa" & Map, "Pk")) = 0 Then
            .Pk = True
        Else
            .Pk = False

        End If

        .Terreno = leer.GetValue("Mapa" & Map, "Terreno")
        .Zona = leer.GetValue("Mapa" & Map, "Zona")
        .Restringir = leer.GetValue("Mapa" & Map, "Restringir")
        .BackUp = val(leer.GetValue("Mapa" & Map, "BACKUP"))

        'pluto:6.0A
        .Resucitar = val(leer.GetValue("Mapa" & Map, "Resucitar"))
        .Invisible = val(leer.GetValue("Mapa" & Map, "Invisible"))
        .Mascotas = val(leer.GetValue("Mapa" & Map, "Mascotas"))
        .Insegura = val(leer.GetValue("Mapa" & Map, "Insegura"))
        .Domar = val(leer.GetValue("Mapa" & Map, "Domar"))
        .Monturas = val(leer.GetValue("Mapa" & Map, "Monturas"))
        .Lluvia = val(leer.GetValue("Mapa" & Map, "Lluvia"))

        'pluto:2.17
        .Dueño = val(leer.GetValue("Mapa" & Map, "Dueño"))
        .Aldea = val(leer.GetValue("Mapa" & Map, "Aldea"))

    End With

    Set MapReader = Nothing
    Set InfReader = Nothing
    Set leer = Nothing

    Erase Buff
    Exit Sub
errh:

    Call LogError("Error cargando mapa: " & Map & " - Pos: " & X & "," & Y & "." & Err.Description)

    Set MapReader = Nothing
    Set InfReader = Nothing
    Set leer = Nothing

End Sub

Public Sub GrabarMapa(ByVal Map As Long, ByRef MAPFILE As String)
'***************************************************
'Author: Unknown
'Last Modification: 12/01/2011
'10/08/2010 - Pato: Implemento el clsByteBuffer para el grabado de mapas
'12/01/2011 - Amraphen: Ahora no se hace backup de NPCs prohibidos (Pretorianos, Mascotas, Invocados y Centinela)
'***************************************************

    On Error Resume Next

    Dim FreeFileMap As Long
    Dim FreeFileInf As Long
    Dim Y As Long
    Dim X As Long
    Dim ByFlags As Byte
    Dim loopc As Long
    Dim MapWriter As clsByteBuffer
    Dim InfWriter As clsByteBuffer
    Dim IniManager As clsIniManager
    Dim NpcInvalido As Boolean

    Set MapWriter = New clsByteBuffer
    Set InfWriter = New clsByteBuffer
    Set IniManager = New clsIniManager

    If FileExist(MAPFILE & ".map", vbNormal) Then
        Kill MAPFILE & ".map"

    End If

    If FileExist(MAPFILE & ".inf", vbNormal) Then
        Kill MAPFILE & ".inf"

    End If

    'Open .map file
    FreeFileMap = FreeFile
    Open MAPFILE & ".Map" For Binary As FreeFileMap

    Call MapWriter.initializeWriter(FreeFileMap)

    'Open .inf file
    FreeFileInf = FreeFile
    Open MAPFILE & ".Inf" For Binary As FreeFileInf

    Call InfWriter.initializeWriter(FreeFileInf)

    'map Header
    Call MapWriter.putInteger(MapInfo(Map).MapVersion)

    Call MapWriter.putString(MiCabecera.Desc, False)
    Call MapWriter.putLong(MiCabecera.crc)
    Call MapWriter.putLong(MiCabecera.MagicWord)

    Call MapWriter.putDouble(0)

    'inf Header
    Call InfWriter.putDouble(0)
    Call InfWriter.putInteger(0)

    'Write .map file
    For Y = YMinMapSize To YMaxMapSize
        For X = XMinMapSize To XMaxMapSize

            With MapData(Map, X, Y)
                ByFlags = 0

                If .Blocked Then ByFlags = ByFlags Or 1
                If .Graphic(2) Then ByFlags = ByFlags Or 2
                If .Graphic(3) Then ByFlags = ByFlags Or 4
                If .Graphic(4) Then ByFlags = ByFlags Or 8
                If .trigger Then ByFlags = ByFlags Or 16

                Call MapWriter.putByte(ByFlags)

                Call MapWriter.putLong(.Graphic(1))

                For loopc = 2 To 4

                    If .Graphic(loopc) Then Call MapWriter.putLong(.Graphic(loopc))
                Next loopc

                If .trigger Then Call MapWriter.putInteger(CInt(.trigger))

                '.inf file
                ByFlags = 0

                If .OBJInfo.ObjIndex > 0 Then
                    If ObjData(.OBJInfo.ObjIndex).OBJType = OBJTYPE_FOGATA Then
                        .OBJInfo.ObjIndex = 0
                        .OBJInfo.Amount = 0

                    End If

                End If

                If .TileExit.Map Then ByFlags = ByFlags Or 1

                ' No hacer backup de los NPCs inválidos ( Mascotas, Invocados)
                If .NpcIndex Then
                    NpcInvalido = (Npclist(.NpcIndex).MaestroUser > 0)

                    If Not NpcInvalido Then ByFlags = ByFlags Or 2

                End If

                If .OBJInfo.ObjIndex Then ByFlags = ByFlags Or 4

                Call InfWriter.putByte(ByFlags)

                If .TileExit.Map Then
                    Call InfWriter.putInteger(.TileExit.Map)
                    Call InfWriter.putInteger(.TileExit.X)
                    Call InfWriter.putInteger(.TileExit.Y)

                End If

                If .NpcIndex And Not NpcInvalido Then Call InfWriter.putInteger(Npclist(.NpcIndex).numero)

                If .OBJInfo.ObjIndex Then
                    Call InfWriter.putInteger(.OBJInfo.ObjIndex)
                    Call InfWriter.putInteger(.OBJInfo.Amount)

                End If

                NpcInvalido = False

            End With

        Next X
    Next Y

    Call MapWriter.saveBuffer
    Call InfWriter.saveBuffer

    'Close .map file
    Close FreeFileMap

    'Close .inf file
    Close FreeFileInf

    Set MapWriter = Nothing
    Set InfWriter = Nothing

    With MapInfo(Map)
        'write .dat file
        Call IniManager.ChangeValue("Mapa" & Map, "Name", .Name)
        Call IniManager.ChangeValue("Mapa" & Map, "MusicNum", .Music)
        Call IniManager.ChangeValue("Mapa" & Map, "StartPos", .StartPos.Map & "-" & .StartPos.X & "-" & .StartPos.Y)

        Call IniManager.ChangeValue("Mapa" & Map, "Terreno", .Terreno)
        Call IniManager.ChangeValue("Mapa" & Map, "Zona", .Zona)
        Call IniManager.ChangeValue("Mapa" & Map, "Restringir", .Restringir)
        Call IniManager.ChangeValue("Mapa" & Map, "BackUp", CStr(.BackUp))

        If .Pk Then
            Call IniManager.ChangeValue("Mapa" & Map, "Pk", "0")
        Else
            Call IniManager.ChangeValue("Mapa" & Map, "Pk", "1")

        End If

        Call IniManager.ChangeValue("Mapa" & Map, "Dueño", CStr(.Dueño))
        Call IniManager.ChangeValue("Mapa" & Map, "Aldea", CStr(.Aldea))

        'pluto:6.0A
        Call IniManager.ChangeValue("Mapa" & Map, "Invisible", CStr(.Invisible))
        Call IniManager.ChangeValue("Mapa" & Map, "Resucitar", CStr(.Resucitar))
        Call IniManager.ChangeValue("Mapa" & Map, "Mascotas", CStr(.Mascotas))
        Call IniManager.ChangeValue("Mapa" & Map, "Insegura", CStr(.Insegura))
        Call IniManager.ChangeValue("Mapa" & Map, "Lluvia", CStr(.Lluvia))
        Call IniManager.ChangeValue("Mapa" & Map, "Domar", CStr(.Domar))
        Call IniManager.ChangeValue("Mapa" & Map, "Monturas", CStr(.Monturas))

        Call IniManager.DumpFile(MAPFILE & ".dat")

    End With

    Set IniManager = Nothing

End Sub

