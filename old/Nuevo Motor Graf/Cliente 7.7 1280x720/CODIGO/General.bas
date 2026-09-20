Attribute VB_Name = "Mod_General"
Option Explicit

Public lFrameTimer As Long

'PLUTO:6.0a--------------------------------
Public Naci As String

Public Enum FontTypeNames

    FONTTYPE_TALK
    FONTTYPE_FIGHT
    FONTTYPE_WARNING
    FONTTYPE_INFO
    FONTTYPE_INFOBOLD
    FONTTYPE_EJECUCION
    FONTTYPE_PARTY
    FONTTYPE_VENENO2
    FONTTYPE_GUILD
    FONTTYPE_SERVER
    FONTTYPE_GUILDMSG
    FONTTYPE_CONSEJO
    FONTTYPE_CONSEJOCAOS
    FONTTYPE_CONSEJOVesA
    FONTTYPE_CONSEJOCAOSVesA
    FONTTYPE_CENTINELA
    FONTTYPE_VENENO
    FONTTYPE_PLUTO
    FONTTYPE_COMERCIO
    FONTTYPE_GLOBAL
    FONTTYPE_CAOS
    FONTTYPE_ARMADA
    FONTTYPE_HORDA
    FONTTYPE_ALIANZA
    FONTTYPE_CHORDA
    FONTTYPE_CALIANZA
    'FONTTYPE_GUERRA

End Enum

Public Type tFont

    Red As Byte
    Green As Byte
    Blue As Byte
    bold As Boolean
    italic As Boolean

End Type

Public FontTypes(26)    As tFont
'--------------------------------------------

Public bO               As Integer
Public bK               As Long

Public banners          As String

Public SoundFogataIndex As Integer
Public bFogata          As Boolean

Public SoundLluviaIndex As Integer
Public bLluvia()        As Byte    ' Array para determinar si
'debemos mostrar la animacion de la lluvia

Public sHKeys()         As String
Public EsLocal          As Boolean

Public Function DirShaders() As String

    DirShaders = App.Path & "\Recursos\Shader\"

End Function

Public Function DirMiniMap() As String

    DirMiniMap = App.Path & "\Recursos\MiniMapa\"

End Function

Public Function DirGraficos() As String

    DirGraficos = App.Path & "\Recursos\Graficos\"

End Function

Public Function DirInterfaces() As String

    DirInterfaces = App.Path & "\Recursos\Interfaces\"

End Function

Public Function DirInit() As String

    DirInit = App.Path & "\Recursos\Init\"

End Function

Public Function DirSound() As String

    DirSound = App.Path & "\Recursos\Wav\"

End Function

Public Function DirMidi() As String

    If Navida = 0 Then
        DirMidi = App.Path & "\Recursos\Midi\"
    Else
        DirMidi = App.Path & "\Recursos\Midi\Navidad\"

    End If

End Function

Public Function DirFonts() As String

    DirFonts = App.Path & "\Recursos\Fuente\"

End Function

Public Function DirMapas() As String

    DirMapas = App.Path & "\Recursos\Mapas\"

End Function

Function RandomNumber(ByVal LowerBound As Variant, ByVal UpperBound As Variant) As Single

    Randomize Timer

    RandomNumber = (UpperBound - LowerBound + 1) * Rnd + LowerBound

    If RandomNumber > UpperBound Then RandomNumber = UpperBound

End Function

Sub Addtostatus(RichTextBox As RichTextBox, Text As String, Red As Byte, Green As Byte, Blue As Byte, bold As Byte, italic As Byte)

    '******************************************
    'Adds text to a Richtext box at the bottom.
    'Automatically scrolls to new text.
    'Text box MUST be multiline and have a 3D
    'apperance!
    '******************************************

    frmCargando.status.SelStart = Len(RichTextBox.Text)
    frmCargando.status.SelLength = 0
    frmCargando.status.SelColor = RGB(Red, Green, Blue)

    If bold Then
        frmCargando.status.SelBold = True
    Else
        frmCargando.status.SelBold = False

    End If

    If italic Then
        frmCargando.status.SelItalic = True
    Else
        frmCargando.status.SelItalic = False

    End If

    frmCargando.status.SelText = Chr(13) & Chr(10) & Text

End Sub

Sub AddtoRichTextBox(RichTextBox As RichTextBox, _
                     Text As String, _
                     Optional Red As Integer = -1, _
                     Optional Green As Integer, _
                     Optional Blue As Integer, _
                     Optional bold As Boolean, _
                     Optional italic As Boolean, _
                     Optional bCrLf As Boolean)

    With RichTextBox

        If (Len(.Text)) > 20000 Then .Text = ""
        .SelStart = Len(RichTextBox.Text)
        .SelLength = 0

        .SelBold = IIf(bold, True, False)
        .SelItalic = IIf(italic, True, False)

        If Not Red = -1 Then .SelColor = RGB(Red, Green, Blue)

        .SelText = IIf(bCrLf, Text, Text & vbCrLf)

        RichTextBox.Refresh

    End With

End Sub

'[END]'
Sub LimpiarRich(RichTextBox As RichTextBox, _
                Text As String, _
                Optional Red As Integer = -1, _
                Optional Green As Integer, _
                Optional Blue As Integer, _
                Optional bold As Boolean, _
                Optional italic As Boolean, _
                Optional bCrLf As Boolean)

    With RichTextBox
        .Text = ""
        .SelStart = Len(RichTextBox.Text)
        .SelLength = 0

        .SelBold = IIf(bold, True, False)
        .SelItalic = IIf(italic, True, False)

        If Not Red = -1 Then .SelColor = RGB(Red, Green, Blue)

        .SelText = IIf(bCrLf, Text, Text & vbCrLf)

        ' RichTextBox.Refresh
    End With

End Sub

Sub AddtoTextBox(TextBox As TextBox, Text As String)

    '******************************************
    'Adds text to a text box at the bottom.
    'Automatically scrolls to new text.
    '******************************************

    TextBox.SelStart = Len(TextBox.Text)
    TextBox.SelLength = 0

    TextBox.SelText = Chr(13) & Chr(10) & Text

End Sub

Sub RefreshAllChars()

    '*****************************************************************
    'Goes through the charlist and replots all the characters on the map
    'Used to make sure everyone is visible
    '*****************************************************************

    Dim LoopC As Integer

    For LoopC = 1 To LastChar

        If CharList(LoopC).Active = 1 Then
            MapData(CharList(LoopC).pos.x, CharList(LoopC).pos.y).CharIndex = LoopC

        End If

    Next LoopC

End Sub

Public Sub InitFonts()

    With FontTypes(FontTypeNames.FONTTYPE_TALK)
        '.red = 255
        ' .green = 255
        '.blue = 255

        .Red = 255
        .Green = 255
        .Blue = 255
        .bold = True
        .italic = True

    End With

    With FontTypes(FontTypeNames.FONTTYPE_FIGHT)
        '.red = 255
        .Red = 255
        .bold = True

    End With

    With FontTypes(FontTypeNames.FONTTYPE_WARNING)
        '.red = 32
        '.green = 51
        '.blue = 223
        '.bold = 1
        '.italic = 1
        .Red = 255
        .Green = 191
        .Blue = 0
        .bold = 1
        .italic = 0

    End With

    With FontTypes(FontTypeNames.FONTTYPE_INFO)
        'pluto:7.0
        '.red = 65
        '.green = 190
        '.blue = 156
        .Red = 128
        .Green = 191
        .Blue = 128

    End With
    
    With FontTypes(FontTypeNames.FONTTYPE_HORDA)
        'pluto:7.0
        '.red = 65
        '.green = 190
        '.blue = 156
        .Red = 202
        .Green = 167
        .Blue = 165

    End With
    
    With FontTypes(FontTypeNames.FONTTYPE_ALIANZA)
        'pluto:7.0
        '.red = 65
        '.green = 190
        '.blue = 156
        .Red = 158
        .Green = 202
        .Blue = 187

    End With
    
    With FontTypes(FontTypeNames.FONTTYPE_CHORDA)
        'pluto:7.0
        '.red = 65
        '.green = 190
        '.blue = 156
        .Red = 194
        .Green = 76
        .Blue = 70

    End With
    
    With FontTypes(FontTypeNames.FONTTYPE_CALIANZA)
        'pluto:7.0
        '.red = 65
        '.green = 190
        '.blue = 156
        .Red = 82
        .Green = 150
        .Blue = 127

    End With

    'no se usa
    With FontTypes(FontTypeNames.FONTTYPE_INFOBOLD)
        .Red = 65
        .Green = 190
        .Blue = 156
        .bold = 1

    End With

    'no se usa
    With FontTypes(FontTypeNames.FONTTYPE_EJECUCION)
        .Red = 191
        .Green = 191
        .Blue = 191
        .bold = 1
        
    End With

    With FontTypes(FontTypeNames.FONTTYPE_PARTY)
        '.red = 255
        '.green = 180
        '.blue = 250
        .Red = 191
        .Green = 191
        .Blue = 255
        .bold = 1

    End With
    
    'With FontTypes(FontTypeNames.FONTTYPE_GUERRA)
    '.red = 255
    '.green = 180
    '.blue = 250
    '.red = 208
    '.green = 136
    '.blue = 23
    '.bold = 1

    ' End With

    With FontTypes(FontTypeNames.FONTTYPE_GLOBAL)
        .Red = 128
        .Green = 128
        .Blue = 255
        .bold = 1

    End With

    'FontTypes(FontTypeNames.FONTTYPE_VENENO).green = 255
    FontTypes(FontTypeNames.FONTTYPE_VENENO).Green = 94

    With FontTypes(FontTypeNames.FONTTYPE_GUILD)
        .Red = 0
        .Green = 191
        .Blue = 0
        .bold = 1

    End With

    'no se usa
    FontTypes(FontTypeNames.FONTTYPE_SERVER).Green = 185

    'no se usa
    With FontTypes(FontTypeNames.FONTTYPE_GUILDMSG)
        .Red = 0
        .Green = 128
        .Blue = 0
        .bold = 1

    End With

    With FontTypes(FontTypeNames.FONTTYPE_CONSEJO)
        '.red = 130
        '.green = 130
        '.blue = 255
        .Red = 100
        .Green = 198
        .Blue = 198
        .bold = 1

    End With

    With FontTypes(FontTypeNames.FONTTYPE_CONSEJOCAOS)
        .Red = 186
        .bold = 1

    End With

    With FontTypes(FontTypeNames.FONTTYPE_CONSEJOVesA)
        ' .green = 200
        '.blue = 255
        .Red = 156
        .Green = 156
        .Blue = 156
        .bold = 1

    End With

    With FontTypes(FontTypeNames.FONTTYPE_CONSEJOCAOSVesA)
        .Red = 255
        .Green = 0
        .Blue = 0
        .bold = 1

    End With

    With FontTypes(FontTypeNames.FONTTYPE_CENTINELA)
        .Green = 255
        .bold = 1

    End With

    With FontTypes(FontTypeNames.FONTTYPE_VENENO)

        .Green = 94

    End With

    With FontTypes(FontTypeNames.FONTTYPE_PLUTO)
        '.red = 255
        '.green = 150
        .Red = 255
        .Green = 191
        .Blue = 255
        .bold = 1

    End With

    With FontTypes(FontTypeNames.FONTTYPE_COMERCIO)
        '.red = 221
        '.green = 216
        '.blue = 9
        .Red = 132
        .Green = 132
        .Blue = 0
        .bold = 1

    End With

End Sub

Function AsciiValidos(ByVal cad As String) As Boolean

    Dim car As Byte
    Dim i   As Integer

    cad = LCase$(cad)

    For i = 1 To Len(cad)
        car = Asc(mid$(cad, i, 1))

        If ((car < 97 Or car > 122) Or car = Asc("º")) And (car <> 255) And (car <> 32) Then
            AsciiValidos = False
            Exit Function

        End If

    Next i

    AsciiValidos = True

End Function

Function CheckUserData(checkemail As Boolean) As Boolean

    'Validamos los datos del user
    Dim LoopC     As Integer
    Dim CharAscii As Integer

    If checkemail Then

        If UserEmail = "" Then
            MsgBox ("Direccion de email invalida")
            Exit Function

        End If

    End If

    If UserPassword = "" Then
        MsgBox ("Ingrese un password.")
        Exit Function

    End If

    For LoopC = 1 To Len(UserPassword)
        CharAscii = Asc(mid$(UserPassword, LoopC, 1))

        If LegalCharacter(CharAscii) = False Then
            MsgBox ("Password invalido.")
            Exit Function

        End If

    Next LoopC

    If UserName = "" Then
        MsgBox ("Nombre invalido.")
        Exit Function

    End If

    If Len(UserName) > 30 Then
        MsgBox ("El nombre debe tener menos de 30 letras.")
        Exit Function

    End If

    For LoopC = 1 To Len(UserName)

        CharAscii = Asc(mid$(UserName, LoopC, 1))

        If LegalCharacter(CharAscii) = False Then
            MsgBox ("Nombre invalido.")
            Exit Function

        End If

    Next LoopC

    CheckUserData = True

End Function

Sub UnloadAllForms()

    On Error Resume Next

    Dim mifrm As Form

    For Each mifrm In Forms
        Unload mifrm
    Next

End Sub

Function LegalCharacter(KeyAscii As Integer) As Boolean

    '*****************************************************************
    'Only allow characters that are Win 95 filename compatible
    '*****************************************************************

    'if backspace allow
    If KeyAscii = 8 Then
        LegalCharacter = True
        Exit Function

    End If

    'Only allow space,numbers,letters and special characters
    If KeyAscii < 32 Or KeyAscii = 44 Then
        LegalCharacter = False
        Exit Function

    End If

    If KeyAscii > 126 Then
        LegalCharacter = False
        Exit Function

    End If

    'Check for bad special characters in between
    If KeyAscii = 34 Or KeyAscii = 42 Or KeyAscii = 47 Or KeyAscii = 58 Or KeyAscii = 60 Or KeyAscii = 62 Or KeyAscii = 63 Or KeyAscii = 92 Or _
            KeyAscii = 124 Then
        LegalCharacter = False
        Exit Function

    End If

    'else everything is cool
    LegalCharacter = True

End Function

Sub SetConnected()

    '*****************************************************************
    'Sets the client to "Connect" mode
    '*****************************************************************

    'Set Connected
    Connected = True

    'Unload the connect form
    Unload frmConnect
    frmMain.Label8.Caption = UserName
    
    Call wGL_Graphic.Use_Device(&H0)
    Call wGL_Graphic.Clear(CLEAR_COLOR Or CLEAR_DEPTH Or CLEAR_STENCIL, &H0, 1#, 0)
    Call wGL_Graphic.Commit
    
    'Load main form
    frmMain.Visible = True

End Sub

Sub MoveTo(ByVal Direccion As E_Heading)

    Dim LegalOk As Boolean

    If Cartel Then Cartel = False

    'pluto:2.3
    If UserPeso > UserPesoMax Then
        Call AddtoRichTextBox(frmMain.RecTxt, "Llevas demasiada carga, no puedes moverte.", 150, 150, 150, True, False, False)
        Exit Sub

    End If
   
    Select Case Direccion

        Case E_Heading.NORTH
            LegalOk = LegalPos(UserPos.x, UserPos.y - 1)

        Case E_Heading.EAST
            LegalOk = LegalPos(UserPos.x + 1, UserPos.y)

        Case E_Heading.SOUTH
            LegalOk = LegalPos(UserPos.x, UserPos.y + 1)

        Case E_Heading.WEST
            LegalOk = LegalPos(UserPos.x - 1, UserPos.y)

    End Select

    If LegalOk And Not UserParalizado Then
        Call SendData("M" & Direccion)

        If Not UserDescansar And Not UserMeditar Then
            MoveCharbyHead UserCharIndex, Direccion
            MoveScreen Direccion

        End If

    Else

        If CharList(UserCharIndex).Heading <> Direccion Then
            Call SendData("ª" & Direccion)

        End If

    End If

End Sub

Sub RandomMove()

    Call MoveTo(RandomNumber(1, 4))

End Sub

Sub CheckKeys()

    '*****************************************************************
    'Checks keys and respond
    '*****************************************************************
    Static lastMovement As Long
    
    If GetTickCount - lastMovement > 64 Then
        lastMovement = GetTickCount
    Else
        Exit Sub

    End If
    
    'No input allowed while Argentum is not the active window
    If Not IsAppActive() Then Exit Sub

    'Control movement interval (this enforces the 1 step loss when meditating / resting client-side)
    '    If GetTickCount - lastMovement > 56 Then
    '        lastMovement = GetTickCount
    '    Else
    '        Exit Sub
    '
    '    End If

    If pausa Then Exit Sub
    
    If EnDuelo Then Exit Sub
    
    If Comerciando Then Exit Sub

    'Don't allow any these keys during movement..
    If UserMoving = 0 Then

        If Not UserEstupido Then

            'Move Up
            If GetAsyncKeyState(CustomKeys.BindedKey(eKeyType.mKeyUp)) < 0 Then
                Call MoveTo(E_Heading.NORTH)
                Exit Sub

            End If

            'Move Right
            If GetAsyncKeyState(CustomKeys.BindedKey(eKeyType.mKeyRight)) < 0 Then
                Call MoveTo(E_Heading.EAST)
                Exit Sub

            End If

            'Move down
            If GetAsyncKeyState(CustomKeys.BindedKey(eKeyType.mKeyDown)) < 0 Then
                Call MoveTo(E_Heading.SOUTH)
                Exit Sub

            End If

            'Move left
            If GetAsyncKeyState(CustomKeys.BindedKey(eKeyType.mKeyLeft)) < 0 Then
                Call MoveTo(E_Heading.WEST)
                Exit Sub

            End If

        Else
            Dim kp As Boolean
            kp = (GetAsyncKeyState(CustomKeys.BindedKey(eKeyType.mKeyUp)) < 0) Or GetAsyncKeyState(CustomKeys.BindedKey(eKeyType.mKeyRight)) < 0 Or _
                    GetAsyncKeyState(CustomKeys.BindedKey(eKeyType.mKeyDown)) < 0 Or GetAsyncKeyState(CustomKeys.BindedKey(eKeyType.mKeyLeft)) < 0

            If kp Then Call RandomMove

        End If

    End If

End Sub

Sub SwitchMap(ByVal Map As Integer)

    '**************************************************************
    'Formato de mapas optimizado para reducir el espacio que ocupan.
    'Diseñado y creado por Juan Martín Sotuyo Dodero (Maraxus) (juansotuyo@hotmail.com)
    '**************************************************************
    On Error GoTo ErrHandler
  
    Dim y        As Long
    Dim x        As Long
    Dim TempInt  As Integer
    Dim ByFlags  As Byte
    Dim hFile    As Integer
    
    Dim Reader   As Network.Reader

    Dim Buffer() As Byte
    
    hFile = FreeFile()
    
    Open DirMapas & "Mapa" & Map & ".map" For Binary As #hFile
    Seek #hFile, 1
    
    ReDim Buffer(LOF(hFile) - 1) As Byte
    
    Get #hFile, , Buffer
    Close #hFile
    
    Set Reader = New Network.Reader
    Call Reader.SetData(Buffer)
    
    'map Header
    MapInfo.MapVersion = Reader.ReadInt16

    Call Reader.Skip(255 + 8 + 8) ' MiCabecera + Double
    
    g_Swarm.Clear
    
    'Load arrays
    For y = YMinMapSize To YMaxMapSize
        For x = XMinMapSize To XMaxMapSize

            With MapData(x, y)
                
                ByFlags = Reader.ReadInt8
                .Blocked = (ByFlags And 1)
                .Graphic(1).GrhIndex = Reader.ReadInt32
                InitGrh .Graphic(1), .Graphic(1).GrhIndex
                    
                'Layer 2 used?
                If ByFlags And 2 Then
                    .Graphic(2).GrhIndex = Reader.ReadInt32
                    InitGrh .Graphic(2), .Graphic(2).GrhIndex
                  
                    With GrhData(.Graphic(2).GrhIndex)
                        Call g_Swarm.Insert(QuadTree.LAYER_2, -1, x, y, .TileWidth, .TileHeight)
                    End With
                Else
                    .Graphic(2).GrhIndex = 0
                End If
                    
                'Layer 3 used?
                If ByFlags And 4 Then
                    .Graphic(3).GrhIndex = Reader.ReadInt32
                    InitGrh .Graphic(3), .Graphic(3).GrhIndex, , IsGrhTree(.Graphic(3).GrhIndex)
                  
                    With GrhData(.Graphic(3).GrhIndex)
                        Call g_Swarm.Insert(QuadTree.LAYER_3, -1, x, y, .TileWidth, .TileHeight)
                    End With
                Else
                    .Graphic(3).GrhIndex = 0
                End If
    
                'Layer 4 used?
                If ByFlags And 8 Then
                    .Graphic(4).GrhIndex = Reader.ReadInt32
                    InitGrh .Graphic(4), .Graphic(4).GrhIndex
                  
                    With GrhData(.Graphic(4).GrhIndex)
                        Call g_Swarm.Insert(QuadTree.LAYER_4, -1, x, y, .TileWidth, .TileHeight)
                    End With
                Else
                    .Graphic(4).GrhIndex = 0
                End If
                    
                'Trigger used?
                If ByFlags And 16 Then
                    .Trigger = Reader.ReadInt16
                Else
                    .Trigger = 0
                End If
                
                'Erase NPCs
                If .CharIndex > 0 Then
                    Call EraseChar(.CharIndex)
                End If
                
                'Erase OBJs
                .ObjGrh.GrhIndex = 0
            End With
        Next x
    Next y

    MapInfo.Name = vbNullString
    MapInfo.Music = vbNullString
    
    CurMap = Map
    If HayMiniMap Then
        DibujarMinimap
    End If
    
    Exit Sub
  
ErrHandler:
    Call LogError("Error" & Err.Number & "(" & Err.Description & ") en Sub SwitchMap de General.bas")
End Sub


Public Function ReadField(ByVal pos As Integer, ByVal Text As String, ByVal SepASCII As Integer) As String

    '*****************************************************************
    'Gets a field from a string
    '*****************************************************************

    Dim i         As Long
    Dim lastPos   As Integer
    Dim CurChar   As String * 1
    Dim FieldNum  As Integer
    Dim Seperator As String

    Seperator = Chr(SepASCII)
    lastPos = 0
    FieldNum = 0

    For i = 1 To Len(Text)
        CurChar = mid(Text, i, 1)

        If CurChar = Seperator Then
            FieldNum = FieldNum + 1

            If FieldNum = pos Then
                ReadField = mid(Text, lastPos + 1, (InStr(lastPos + 1, Text, Seperator, vbTextCompare) - 1) - (lastPos))
                Exit Function

            End If

            lastPos = i

        End If

    Next i

    FieldNum = FieldNum + 1

    If FieldNum = pos Then
        ReadField = mid(Text, lastPos + 1)

    End If

End Function

Function FieldCount(ByRef Text As String, ByVal SepASCII As Byte) As Long

    '*****************************************************************
    'Gets the number of fields in a delimited string
    'Author: Juan Martín Sotuyo Dodero (Maraxus)
    'Last Modify Date: 07/29/2007
    '*****************************************************************
    Dim Count     As Long
    Dim curPos    As Long
    Dim delimiter As String * 1
    
    If LenB(Text) = 0 Then Exit Function
    
    delimiter = Chr$(SepASCII)
    
    curPos = 0
    
    Do
        curPos = InStr(curPos + 1, Text, delimiter)
        Count = Count + 1
    Loop While curPos <> 0
    
    FieldCount = Count

End Function


Function FileExist(ByVal File As String, ByVal FileType As VbFileAttribute) As Boolean
    
    FileExist = Len(Dir$(File, FileType)) <> 0

End Function

Public Function CurServerPasRecPort() As Integer

    'pluto:6.4
    If ServActual = 1 Then
        CurServerPasRecPort = "9000"
    Else
        'CurServerPasRecPort = "10281"
        CurServerPasRecPort = "9000"

    End If

End Function

Public Function CurServerIp() As String

    'nati:modifico esto tambien

    If EsLocal Then
        CurServerIp = "127.0.0.1"
    Else

        If ServActual = 1 Then
            CurServerIp = "127.0.0.1"
        Else
            CurServerIp = "127.0.0.1"

        End If

    End If

End Function

Public Function CurServerPort() As Integer

    'pluto:6.4
    If ServActual = 1 Then
        CurServerPort = "9000"    '7664 para pruebas
        frmMain.Socket1.Disconnect
    Else
        CurServerPort = "9000"
        frmMain.Socket1.Disconnect

    End If

End Function

Public Sub LeerLineaComandos()

    '*************************************************
    'Author: Unknown
    'Last modified: 25/11/2008 (BrianPr)
    '
    '*************************************************
    Dim t()      As String
    Dim i        As Long

    Dim UpToDate As Boolean
    Dim Patch    As String

    'Parseo los comandos
    t = Split(Command, " ")

    For i = LBound(t) To UBound(t)

        Select Case UCase$(t(i))

            Case "/NORES"    'no cambiar la resolucion

            Case "/UPTODATE"
                UpToDate = True

            Case "/LOCAL"
                EsLocal = True

        End Select

    Next i

    'Call IsFileLocked(App.Path & "\Launcher.exe")
    'Call AoUpdate(isOpen, False)
End Sub

Public Function IsFileLocked(PathName As String) As Boolean

    On Error GoTo ErrHandler

    Dim i As Integer

    If Len(Dir$(PathName)) Then
        i = FreeFile()
        Open PathName For Random Access Read Write Lock Read Write As #i
        Lock i    'Redundant but let's be 100% sure
        Unlock i
        Close i
    Else
        Err.Raise 53

    End If

ExitProc:

    On Error GoTo 0

    Exit Function

ErrHandler:

    Select Case Err.Number

        Case 70    'Unable to acquire exclusive lock
            isOpen = True

        Case Else
            MsgBox "Error " & Err.Number & " (" & Err.Description & ")"

    End Select

    Resume ExitProc

    Resume

End Function

''
' Runs AoUpdate if we haven't updated yet, patches aoupdate and runs Client normally if we are updated.
'
' @param UpToDate Specifies if we have checked for updates or not
' @param NoREs Specifies if we have to set nores arg when running the client once again (if the AoUpdate is executed).

Private Sub AoUpdate(ByVal UpToDate_ As Boolean, ByVal NoRes_ As Boolean)

    '*************************************************
    'Author: BrianPr
    'Created: 25/11/2008
    'Last modified: 25/11/2008
    '
    '*************************************************
    Dim extraArgs  As String
    Dim Reintentos As Integer

    If Not isOpen Then

        'No recibe update, ejecutar AU
        'Ejecuto el AoUpdate, sino me voy
        If Dir(App.Path & "\Launcher.exe", vbArchive) = vbNullString Then
            MsgBox "No se encuentra el archivo de actualización Launcher.exe por favor descarguelo y vuelva a intentar", vbCritical
            End
        Else
Reintentar:

            On Error GoTo Error

            'FileCopy App.path & "\AoUpdate.exe", App.path & "\AoUpdateTMP.exe"
            If NoRes_ Then
                extraArgs = " /nores"

            End If

            Call ShellExecute(0, "Open", App.Path & "\Launcher.exe", App.EXEName & ".exe", App.Path, 1)
            'Call Shell(App.path & "\AoUpdateTMP.exe", App.EXEName & ".exe")
            End
            Exit Sub

        End If

    Else

        'If FileExist(App.Path & "\Launcher.exe", vbArchive) Then Kill App.Path & "\Launcher.exe"

    End If

    Exit Sub

Error:

    If Err.Number = 75 Then    'Si el archivo AoUpdateTMP.exe está en uso, entonces esperamos 5 ms y volvemos a intentarlo hasta que nos deje.
        Reintentos = Reintentos + 1

        If Reintentos = 3 Then
            Call MsgBox( _
                    "El proceso Launcher.exe se encuentra abierto o protegido y no es posible reemplazarlo. Cierre el proceso y vuelva a ejecutar el juego.", _
                    vbError)
            End
        Else
            Sleep 500
            GoTo Reintentar:

        End If

    Else
        MsgBox Err.Description & vbCrLf, vbInformation, "[ " & Err.Number & " ]" & " Error "
        End

    End If

End Sub

Sub Main()

    Call SetResolution

    Dim flechudo As Integer
    SetKey ("CLIENTE AODRAG v5.0")

    If App.PrevInstance Then
        Call MsgBox("¡World of AO ya esta corriendo! No es posible correr otra instancia del juego. Haga click en Aceptar para salir.", vbApplicationModal + vbInformation + vbOKOnly, "Error al ejecutar")
        End

    End If

    Dim f              As Boolean
    Dim ulttick        As Long, esttick As Long
    Dim timers(1 To 6) As Long
    Dim IX             As Byte
    Dim IX2            As Byte
    
    'pluto:7.0
    '-------------
    'pluto:6.8
    FormP.Show
    FormP.Visible = False
    '-------
    'pluto:6.0a tipos de mapas
    'seguros para todos
    Segura(1) = 1
    Segura(81) = 1
    Segura(183) = 1
    Segura(184) = 1
    Segura(34) = 1
    Segura(20) = 1
    'para crimis
    Segura(170) = 2
    Segura(62) = 2
    Segura(63) = 2
    Segura(64) = 2
    'para ciudas
    Segura(58) = 3
    Segura(59) = 3
    Segura(60) = 3
    Segura(61) = 3
    Segura(83) = 3
    Segura(84) = 3
    Segura(85) = 3
    Segura(66) = 3
    'inseguras
    Segura(150) = 4
    Segura(151) = 4
    Segura(157) = 4
    Segura(111) = 4
    Segura(112) = 4
    'para newbies
    Segura(261) = 5
    Segura(262) = 5
    Segura(263) = 5
    Segura(264) = 5
    Segura(200) = 5
    Segura(201) = 5
    Segura(233) = 5
    Segura(234) = 5
    Segura(235) = 5
    Segura(71) = 5
    Segura(72) = 5
    Segura(73) = 5
    Segura(205) = 5
    Segura(206) = 5
    Segura(207) = 5
    Segura(208) = 5
    Segura(218) = 5
    Segura(215) = 5
    Segura(96) = 5
    Segura(97) = 5
    Segura(98) = 5
    Segura(19) = 5
    Segura(24) = 5
    Segura(27) = 5
    Segura(266) = 5
    Segura(267) = 5
    Segura(243) = 5
    Segura(78) = 5
    Segura(79) = 5
    Segura(80) = 5
    'pluto:7.0
    
    'Luzaviso dificultad mapa
    luzaviso(1) = 0    '(mapa seguro)
    luzaviso(2) = 5
    luzaviso(3) = 9
    luzaviso(4) = 10
    luzaviso(5) = 12
    luzaviso(6) = 10
    luzaviso(7) = 9
    luzaviso(8) = 9
    luzaviso(9) = 9
    luzaviso(10) = 12
    luzaviso(11) = 10
    luzaviso(12) = 10
    luzaviso(13) = 12
    luzaviso(14) = 9
    luzaviso(15) = 14
    luzaviso(16) = 14
    luzaviso(17) = 15
    luzaviso(18) = 14
    luzaviso(19) = 12
    luzaviso(20) = 12
    luzaviso(21) = 15
    luzaviso(22) = 12
    luzaviso(23) = 9
    luzaviso(24) = 12
    luzaviso(25) = 12
    luzaviso(26) = 24
    luzaviso(27) = 14
    luzaviso(28) = 5
    luzaviso(29) = 14
    luzaviso(30) = 16
    luzaviso(31) = 9
    luzaviso(32) = 9
    luzaviso(33) = 22
    luzaviso(34) = 0    '(mapa seguro)
    luzaviso(35) = 9
    luzaviso(36) = 16
    luzaviso(37) = 14
    luzaviso(38) = 18
    luzaviso(39) = 18
    luzaviso(40) = 22
    luzaviso(41) = 0
    luzaviso(42) = 0
    luzaviso(43) = 20
    luzaviso(44) = 20
    luzaviso(45) = 18
    luzaviso(46) = 6
    luzaviso(47) = 0
    luzaviso(48) = 50
    luzaviso(49) = 0
    luzaviso(50) = 18
    luzaviso(51) = 20
    luzaviso(52) = 9
    luzaviso(53) = 18
    luzaviso(54) = 20
    luzaviso(55) = 16
    luzaviso(56) = 14
    luzaviso(57) = 16
    luzaviso(58) = 6
    luzaviso(59) = 2
    luzaviso(60) = 9
    luzaviso(61) = 0
    luzaviso(62) = 0
    luzaviso(63) = 0
    luzaviso(64) = 0
    luzaviso(65) = 10
    luzaviso(66) = 9
    luzaviso(67) = 12
    luzaviso(68) = 11
    luzaviso(69) = 20
    luzaviso(70) = 12
    luzaviso(71) = 16
    luzaviso(72) = 16
    luzaviso(73) = 18
    luzaviso(74) = 18
    luzaviso(75) = 16
    luzaviso(76) = 20
    luzaviso(77) = 0
    luzaviso(78) = 10
    luzaviso(79) = 18
    luzaviso(80) = 16
    luzaviso(81) = 18
    luzaviso(82) = 0
    luzaviso(83) = 0
    luzaviso(84) = 0
    luzaviso(85) = 16
    luzaviso(86) = 0
    luzaviso(87) = 0
    luzaviso(88) = 0
    luzaviso(89) = 0
    luzaviso(90) = 20
    luzaviso(91) = 0
    luzaviso(92) = 0
    luzaviso(93) = 0
    luzaviso(94) = 0
    luzaviso(95) = 0
    luzaviso(96) = 10
    luzaviso(97) = 12
    luzaviso(98) = 12
    luzaviso(99) = 0
    luzaviso(100) = 0
    luzaviso(101) = 0
    luzaviso(102) = 0
    luzaviso(103) = 0
    luzaviso(104) = 0
    luzaviso(105) = 0
    luzaviso(106) = 0
    luzaviso(107) = 0
    luzaviso(108) = 20
    luzaviso(109) = 0
    luzaviso(110) = 50
    luzaviso(111) = 0
    luzaviso(112) = 20
    luzaviso(113) = 50
    luzaviso(114) = 50
    luzaviso(115) = 22
    luzaviso(116) = 24
    luzaviso(117) = 0
    luzaviso(118) = 0
    luzaviso(119) = 0
    luzaviso(120) = 18
    luzaviso(121) = 0
    luzaviso(122) = 0
    luzaviso(123) = 0
    luzaviso(124) = 18
    luzaviso(125) = 16
    luzaviso(126) = 0
    luzaviso(127) = 0
    luzaviso(128) = 0
    luzaviso(129) = 0
    luzaviso(130) = 0
    luzaviso(131) = 0
    luzaviso(132) = 16
    luzaviso(133) = 0
    luzaviso(134) = 16
    luzaviso(135) = 0
    luzaviso(136) = 0
    luzaviso(137) = 0
    luzaviso(138) = 0
    luzaviso(139) = 40
    luzaviso(140) = 38
    luzaviso(141) = 38
    luzaviso(142) = 40
    luzaviso(143) = 16
    luzaviso(144) = 50
    luzaviso(145) = 43
    luzaviso(146) = 43
    luzaviso(147) = 0
    luzaviso(148) = 12
    luzaviso(149) = 0
    luzaviso(150) = 0
    luzaviso(151) = 0
    luzaviso(152) = 0
    luzaviso(153) = 0
    luzaviso(154) = 16
    luzaviso(155) = 0
    luzaviso(156) = 30
    luzaviso(157) = 0
    luzaviso(158) = 40
    luzaviso(159) = 50
    luzaviso(160) = 50
    luzaviso(161) = 35
    luzaviso(162) = 35
    luzaviso(163) = 0
    luzaviso(164) = 0
    luzaviso(165) = 0
    luzaviso(166) = 50    'Castillo norte
    luzaviso(167) = 50    'Castillo sur
    luzaviso(168) = 50    'Castillo este
    luzaviso(169) = 50    'Castillo oeste
    luzaviso(170) = 0
    luzaviso(171) = 50
    luzaviso(172) = 42
    luzaviso(173) = 42
    luzaviso(174) = 42
    luzaviso(175) = 42
    luzaviso(176) = 42
    luzaviso(177) = 30
    luzaviso(178) = 35
    luzaviso(179) = 35
    luzaviso(180) = 0
    luzaviso(181) = 6
    luzaviso(182) = 0
    luzaviso(183) = 0
    luzaviso(184) = 0
    luzaviso(185) = 50    'fortaleza
    luzaviso(186) = 0
    luzaviso(187) = 0
    luzaviso(188) = 0
    luzaviso(189) = 20
    luzaviso(190) = 0
    luzaviso(191) = 0
    luzaviso(192) = 0
    luzaviso(193) = 24
    luzaviso(194) = 0
    luzaviso(195) = 0
    luzaviso(196) = 10
    luzaviso(197) = 16
    luzaviso(198) = 16
    luzaviso(199) = 16
    luzaviso(200) = 18
    luzaviso(201) = 16
    luzaviso(202) = 18
    luzaviso(203) = 16
    luzaviso(204) = 16
    luzaviso(205) = 14
    luzaviso(206) = 14
    luzaviso(207) = 14
    luzaviso(208) = 12
    luzaviso(209) = 0
    luzaviso(210) = 0
    luzaviso(211) = 0
    luzaviso(212) = 0
    luzaviso(213) = 0
    luzaviso(214) = 0
    luzaviso(215) = 9
    luzaviso(216) = 42
    luzaviso(217) = 36
    luzaviso(218) = 18
    luzaviso(219) = 0
    luzaviso(220) = 0
    luzaviso(221) = 0
    luzaviso(222) = 0
    luzaviso(223) = 0
    luzaviso(224) = 14
    luzaviso(225) = 16
    luzaviso(226) = 14
    luzaviso(227) = 14
    luzaviso(228) = 14
    luzaviso(229) = 14
    luzaviso(230) = 0
    luzaviso(231) = 0
    luzaviso(232) = 0
    luzaviso(233) = 16
    luzaviso(234) = 12
    luzaviso(235) = 18
    luzaviso(236) = 0
    luzaviso(237) = 0
    luzaviso(238) = 0
    luzaviso(239) = 0
    luzaviso(240) = 0
    luzaviso(241) = 0
    luzaviso(242) = 0
    luzaviso(243) = 18
    luzaviso(244) = 22
    luzaviso(245) = 24
    luzaviso(246) = 38
    luzaviso(247) = 30
    luzaviso(248) = 38
    luzaviso(249) = 0
    luzaviso(250) = 0
    luzaviso(251) = 0    'Capitán defensor de ciudad
    luzaviso(252) = 0    'Capitán defensor de ciudad
    luzaviso(253) = 0    'Capitán defensor de ciudad
    luzaviso(254) = 0    'Capitán defensor de ciudad
    luzaviso(255) = 0    'Capitán defensor de ciudad
    luzaviso(256) = 0    'Capitán defensor de ciudad
    luzaviso(257) = 0    'Capitán defensor de ciudad
    luzaviso(258) = 0    'Capitán defensor de ciudad
    luzaviso(259) = 0    'Capitán defensor de ciudad
    luzaviso(260) = 0    'Capitán defensor de ciudad
    luzaviso(261) = 16
    luzaviso(262) = 14
    luzaviso(263) = 18
    luzaviso(264) = 14
    luzaviso(265) = 0
    luzaviso(266) = 12
    luzaviso(267) = 16
    luzaviso(268) = 50    ' Ettin
    luzaviso(269) = 50    'Ettin
    luzaviso(270) = 50    'Ettin
    luzaviso(271) = 50    'Ettin
    luzaviso(272) = 14
    luzaviso(273) = 0
    luzaviso(274) = 0
    luzaviso(275) = 0
    luzaviso(276) = 0
    luzaviso(277) = 0
    luzaviso(278) = 0
    luzaviso(279) = 0
    luzaviso(280) = 0
    luzaviso(281) = 0
    luzaviso(282) = 0
    luzaviso(283) = 0
    luzaviso(284) = 0
    luzaviso(285) = 0
    luzaviso(286) = 0
    luzaviso(287) = 0
    luzaviso(288) = 0
    luzaviso(289) = 0
    luzaviso(290) = 0
    luzaviso(291) = 0
    luzaviso(292) = 0
    luzaviso(293) = 0
    luzaviso(294) = 0
    luzaviso(295) = 0
    luzaviso(296) = 0
    luzaviso(297) = 0
    luzaviso(298) = 0
    luzaviso(299) = 0
    luzaviso(300) = 0

    '-------------------------------

    web = GetVar(DirInit & "Web.dat", "WEB", "INIT")

    frmCargando.Show
    frmCargando.Refresh
    UserParalizado = False

    AddtoRichTextBox frmCargando.status, "Iniciando constantes...", 255, 255, 255, 255, 255, 1

    Call LeerLineaComandos

    ReDim Ciudades(1 To NUMCIUDADES) As String
    Ciudades(1) = "Ullathorpe"
    Ciudades(2) = "Nix"
    Ciudades(3) = "Banderbill"

    ReDim CityDesc(1 To NUMCIUDADES) As String
    CityDesc(1) = "Ullathorpe está establecida en el medio de los grandes bosques de Argentum, es principalmente un pueblo de campesinos y leñadores. Su ubicación hace de Ullathorpe un punto de paso obligado para todos los aventureros ya que se encuentra cerca de los lugares más legendarios de este mundo."
    CityDesc(2) = "Nix es una gran ciudad. Edificada sobre la costa oeste del principal continente de Argentum."
    CityDesc(3) = "Banderbill se encuentra al norte de Ullathorpe y Nix, es una de las ciudades más importantes de todo el imperio."

    ReDim ListaRazas(1 To NUMRAZAS) As String
    ListaRazas(1) = "Humano"
    ListaRazas(2) = "Elfo"
    ListaRazas(3) = "Elfo Oscuro"
    ListaRazas(4) = "Gnomo"
    ListaRazas(5) = "Enano"
    ListaRazas(6) = "Orco"
    ListaRazas(7) = "Vampiro"
    ListaRazas(8) = "Abisario"
    ListaRazas(9) = "Goblin"
    ListaRazas(10) = "Tauros"
    ListaRazas(11) = "Licantropos"
    ListaRazas(12) = "NoMuerto"

    ReDim ListaClases(1 To NUMCLASES) As String
    ListaClases(1) = "Mago"
    ListaClases(2) = "Clerigo"
    ListaClases(3) = "Guerrero"
    ListaClases(4) = "Asesino"
    ListaClases(5) = "Ladron"
    ListaClases(6) = "Bardo"
    ListaClases(7) = "Druida"
    ListaClases(8) = "Bandido"
    ListaClases(9) = "Paladin"
    ListaClases(10) = "Cazador"
    ListaClases(11) = "Pescador"
    ListaClases(12) = "Herrero"
    ListaClases(13) = "Leñador"
    ListaClases(14) = "Minero"
    ListaClases(15) = "Carpintero"
    ListaClases(16) = "Pirata"
    ListaClases(17) = "Ermitaño"
    ListaClases(18) = "Arquero"
    ListaClases(19) = "Domador"
    
    ReDim SkillsNames(1 To NUMSKILLS) As String
    SkillsNames(1) = "Suerte"
    SkillsNames(2) = "Aprendizaje de Magias"
    SkillsNames(3) = "Robar"
    SkillsNames(4) = "Tacticas de combate"
    SkillsNames(5) = "Combate con Armas"
    SkillsNames(6) = "Meditar"
    SkillsNames(7) = "Apuñalar"
    SkillsNames(8) = "Ocultarse"
    SkillsNames(9) = "Supervivencia"
    SkillsNames(10) = "Talar arboles"
    SkillsNames(11) = "Comercio"
    SkillsNames(12) = "Defensa con escudos"
    SkillsNames(13) = "Pesca"
    SkillsNames(14) = "Mineria"
    SkillsNames(15) = "Carpinteria"
    SkillsNames(16) = "Herreria"
    SkillsNames(17) = "Liderazgo"
    SkillsNames(18) = "Domar animales"
    SkillsNames(19) = "Combate con Proyectiles"
    SkillsNames(20) = "Golpeo con Armas Dobles"
    SkillsNames(21) = "Navegacion"
    SkillsNames(22) = "Daños en Magia"
    SkillsNames(23) = "Defensa en Magias"
    SkillsNames(24) = "Inmunidad a Magias"
    SkillsNames(25) = "Daño en Armas"
    SkillsNames(26) = "Defensa en Armas"
    SkillsNames(27) = "Aprendizaje de Armas"
    SkillsNames(28) = "Daño de Proyectiles"
    SkillsNames(29) = "Defensa de Proyectiles"
    SkillsNames(30) = "Aprendizaje de Proyectiles"
    SkillsNames(31) = "Tactica Combate Proyectiles"
    
    ReDim UserSkills(1 To NUMSKILLS) As Integer
    ReDim UserAtributos(1 To NUMATRIBUTOS) As Integer
    ReDim AtributosNames(1 To NUMATRIBUTOS) As String
    AtributosNames(1) = "Fuerza"
    AtributosNames(2) = "Agilidad"
    AtributosNames(3) = "Inteligencia"
    AtributosNames(4) = "Carisma"
    AtributosNames(5) = "Constitucion"

    frmOldPersonaje.NameTxt.Text = vbNullString
    frmOldPersonaje.PasswordTxt.Text = vbNullString
    
    Navida = Val(GetVar(DirInit & "opciones.dat", "OPCIONES", "navidad"))
    SinTecho = Val(GetVar(DirInit & "opciones.dat", "OPCIONES", "sintechos"))
    NivelVolMusica = Val(GetVar(DirInit & "opciones.dat", "OPCIONES", "nivelvolumenmusica"))
    Musi = Val(GetVar(DirInit & "opciones.dat", "OPCIONES", "musica"))
    Son = Val(GetVar(DirInit & "opciones.dat", "OPCIONES", "sonido"))
    Fasis = Val(GetVar(DirInit & "opciones.dat", "OPCIONES", "asistente"))
    LugarServer = GetSetting("AODRAG", "SERVIDOR", "ACTUAL", 1)
    Chats = Val(GetVar(DirInit & "opciones.dat", "OPCIONES", "Chat"))
    DBe = Val(GetVar(DirInit & "opciones.dat", "OPCIONES", "DobleEquipar2"))
    FontPrimary = GetVar(DirInit & "opciones.dat", "OPCIONES", "FontPrimary")
    FontSecondary = GetVar(DirInit & "opciones.dat", "OPCIONES", "FontSecondary")

    'AddtoRichTextBox frmCargando.status, "Hecho", , , , 1
    AddtoRichTextBox frmCargando.status, "World Of Argentum Online", 255, 255, 255, 255, 255, 1
    
    Dim variable As String
    Dim ie       As Object

    If Not (UCase$(web) = "NINGUNA" Or web = "") Then
        variable = web
        Set ie = CreateObject("InternetExplorer.Application")
        ie.Visible = True
        ie.Navigate variable

    End If

    AddtoRichTextBox frmCargando.status, "Cargando Sonidos....", 255, 255, 255, 255, 255, 1
    AddtoRichTextBox frmCargando.status, "Hecho", 255, 255, 255, 255, 255, 1

    Dim LoopC As Integer

    ENDL = Chr$(13) & Chr$(10)
    ENDC = Chr$(1)

    If Not InitTileEngine(frmMain.hWnd, 32, Round(frmMain.MainViewPic.ScaleHeight / 32), Round(frmMain.MainViewPic.ScaleWidth / 32), 9, 8, 0.018) Then
        Call CloseClient
    End If
    
    If Not wGl_Init(frmMain.MainViewPic.hWnd, frmMain.MainViewPic.ScaleWidth, frmMain.MainViewPic.ScaleHeight) Then
        Call CloseClient
    End If
  
    Call AddtoRichTextBox(frmCargando.status, "Creando animaciones...", 255, 255, 255, 255, 255, 1)

    Call CargarArrayLluvia
    Call CargarAnimArmas
    Call CargarAnimEscudos
    Call CargarAnimAlas

    'pluto:6.0A
    Call InitFonts
    
    Mp3Music = True 'Not ClientSetup.bNoMp3
    
    UserMap = 1
    AddtoRichTextBox frmCargando.status, "¡Bienvenido al Mundo World of Argentum Online!", 255, 255, 255, 255, 255, 1
    Sleep 3000
    Unload frmCargando

    Call Audio.Initialize(frmMain.hWnd, DirSound, DirMidi)
    Audio.MusicMp3Activated = True 'Not ClientSetup.bNoMp3
    
    Call Inventario.Initialize(frmMain.picInv, MAX_INVENTORY_SLOTS)
    
    Call Audio.MusicMP3Play(App.Path & "\Recursos\MP3\" & "2" & ".mp3")
    'Debug.Print Val(GetVar(DirInit & "opciones.dat", "OPCIONES", "nivelvolumenmusica")) & "aca inicia todo"
    
    Audio.MusicVolume = Val(GetVar(DirInit & "opciones.dat", "OPCIONES", "nivelvolumenmusica"))
    'Enable / Disable audio
    Audio.MusicActivated = (Musi = 1)
    Audio.SoundActivated = (Son = 1)

    'Call Audio.PlayMIDI(MIdi_Inicio & ".mid")

    frmPres.Picture = cLoadPicture(DirInterfaces & "LOGODRAG.BMP")

    Naci = Val(GetVar(DirInit & "Web.dat", "WEB", "NACI"))

    If Naci = 0 Then
        frmNaci.Show

        Do While Naci = 0
            DoEvents
        Loop
        
        Call WriteVar(DirInit & "Web.dat", "WEB", "NACI", Naci)

    End If

    frmConnect.Visible = True

    frmMain.Socket1.HostName = CurServerIp
    frmMain.Socket1.RemotePort = CurServerPort
    
    prgRun = True
    pausa = False
    EnDuelo = False
    
    Dim vete As Byte
    Dim viz  As Byte
    Dim vaz  As Byte
    
    lFrameTimer = GetTickCount

    '[END]'
    Do While prgRun
        
        Call wGl_Renderer

        esttick = GetTickCount

        'pluto:6.0A
        If NoPuedeMagia = True And vete = 0 Then
            timers(4) = 0
            vete = 1
        End If

        For LoopC = 1 To UBound(timers)
            timers(LoopC) = timers(LoopC) + (esttick - ulttick)

            'timer de trabajo
            If timers(1) >= tUs Then
                timers(1) = 0
                NoPuedeUsar = False
            End If

            'timer de attaque (77)
            If timers(2) >= tAt Then
                timers(2) = 0
                UserCanAttack = 1
            End If

            'pluto:2.4.5
            If timers(3) >= tTr Then
                timers(3) = 0
                NoPuedeTirar = False
            End If

            If timers(4) >= tMg Then
                timers(4) = 0
                NoPuedeMagia = False
                vete = 0
            End If

            If timers(6) >= 5000 Then
                timers(6) = 0
            End If

        Next LoopC

        ulttick = GetTickCount
        Call Audio.MusicMP3GetLoop

        'pluto:2.15
        If UCase$(UserClase) = "ARQUERO" Or UCase$(UserClase) = "CAZADOR" Then
            flechudo = (Val(frmMain.LvlLbl) * 20)
        Else
            flechudo = 0
        End If

        If flechudo > 800 Then flechudo = 800

        If timers(5) >= tFle - flechudo Then  'tFle Then
            timers(5) = 0
            'NoPuedeFlechas = False
        End If

        If FrmGol.Visible = True And viz = 0 Then
            timers(3) = 0
            viz = 1
        End If

        If timers(3) = 3000 And viz = 1 Then
            FrmGol.Visible = False
            viz = 0
        End If

        If frmMain.Label4.Visible = True And vaz = 0 Then
            timers(3) = 0
            vaz = 1
        End If

        If timers(3) = 3000 And vaz = 1 Then
            frmMain.Label4.Visible = False
            vaz = 0
        End If
        
        DoEvents

    Loop

    Call CloseClient

ManejadorErrores:
    LogError "Contexto:" & Err.HelpContext & " Desc:" & Err.Description & " Fuente:" & Err.source
    End

End Sub

Public Sub InicializarNombres()

    Dim SearchVar As String
    Dim ReadInfo  As clsIniManager
    Dim i         As Long
    Dim j         As Long
    Dim o         As Long
    Dim Sex       As String
    
    
    Set ReadInfo = New clsIniManager
    
    Call ReadInfo.Initialize(DirInit & "CharInfo.dat")

 
    For i = 1 To 2
       
        Sex = IIf(i = eGenero.Hombre, "Hombre", "Mujer")
        
        For j = 1 To NUMRAZAS
            For o = 0 To 1
                BodysAndHeads(i, j).Body = Val(ReadInfo.GetValue("INIT", Sex & "Cuerpo" & j))
            
                BodysAndHeads(i, j).HeadFirst = Val(ReadInfo.GetValue("INIT", Sex & "HeadInicio" & j))
                BodysAndHeads(i, j).HeadLast = Val(ReadInfo.GetValue("INIT", Sex & "Headfinal" & j))

            Next o
        Next j
    Next i

    Set ReadInfo = Nothing

End Sub

Public Sub CloseClient()

    frmCargando.Show
    frmCargando.Refresh
    
    AddtoRichTextBox frmCargando.status, "Cerrando Argentum Online.", 255, 255, 255, 255, 255, 1
    
    Call Resolution.ResetResolution

    EngineRun = False
  
    AddtoRichTextBox frmCargando.status, "Liberando recursos...", 255, 255, 255, 255, 255, 1

    Set Audio = Nothing
    Set Inventario = Nothing
    Set CustomKeys = Nothing
    Set Dialogos = Nothing
    
    AddtoRichTextBox frmCargando.status, "Hecho", 255, 255, 255, 255, 255, 1
    AddtoRichTextBox frmCargando.status, "¡¡Gracias por jugar Argentum Online!!", 255, 255, 255, 255, 255, 1
    
    Call UnloadAllForms
    End

End Sub

Sub WriteVar(ByVal File As String, ByVal Main As String, ByVal Var As String, ByVal value As String)

    '*****************************************************************
    'Writes a var to a text file
    '*****************************************************************

    Call writeprivateprofilestring(Main, Var, value, File)

End Sub

Function GetVar(ByVal File As String, ByVal Main As String, ByVal Var As String) As String

    '*****************************************************************
    'Gets a Var from a text file
    '*****************************************************************

    Dim sSpaces As String  ' This will hold the input that the program will retrieve
    sSpaces = Space$(5000) ' This tells the computer how long the longest string can be. If you want, you can change the number 75 to any number you wish

    Call getprivateprofilestring(Main, Var, vbNullString, sSpaces, Len(sSpaces), File)

    GetVar = RTrim$(sSpaces)
    GetVar = Left$(GetVar, Len(GetVar) - 1)

End Function

'[CODE 002]:MatuX
'
'  Función para chequear el email
'
Public Function CheckMailString(ByRef sString As String) As Boolean

    On Error GoTo errHnd:

    Dim lPos As Long, lX As Long
    Dim iAsc As Integer

    '1er test: Busca un simbolo @
    lPos = InStr(sString, "@")

    If (lPos <> 0) Then

        '2do test: Busca un simbolo . después de @ + 1
        If Not (IIf((InStr(lPos, sString, ".", vbBinaryCompare) > (lPos + 1)), True, False)) Then Exit Function

        '3er test: Valída el ultimo caracter
        If Not (CMSValidateChar_(Asc(Right$(sString, 1)))) Then Exit Function

        '4to test: Recorre todos los caracteres y los valída
        For lX = 0 To Len(sString) - 1    'el ultimo no porque ya lo probamos

            If Not (lX = (lPos - 1)) Then
                iAsc = Asc(mid$(sString, (lX + 1), 1))

                If Not (iAsc = 46 And lX > (lPos - 1)) Then If Not CMSValidateChar_(iAsc) Then Exit Function

            End If

        Next lX

        'Finale
        CheckMailString = True

    End If

errHnd:

    'Error Handle
End Function

Private Function CMSValidateChar_(ByRef iAsc As Integer) As Boolean

    'pluto:6.9 añade 65 y 95
    CMSValidateChar_ = IIf((iAsc >= 45 And iAsc <= 57) Or (iAsc >= 65 And iAsc <= 90) Or (iAsc >= 97 And iAsc <= 122) Or (iAsc = 95), True, False)

End Function

Function HayAgua(x As Integer, y As Integer) As Boolean

    If MapData(x, y).Graphic(1).GrhIndex >= 1505 And MapData(x, y).Graphic(1).GrhIndex <= 1520 And MapData(x, y).Graphic(2).GrhIndex = 0 Or MapData(x, y).Graphic(1).GrhIndex >= 36563 And MapData(x, y).Graphic(1).GrhIndex <= 36578 And MapData(x, y).Graphic(2).GrhIndex = 0 Then
        HayAgua = True
    Else
        HayAgua = False

    End If

End Function

Public Function porcentaje(ByVal total As Long, ByVal Porc As Long) As Long

    On Error GoTo Fallo

    porcentaje = (total * Porc) / 100

    Exit Function
Fallo:
    Call LogError("porcentaje " & Err.Number & " D: " & Err.Description)

End Function

Public Sub DumpGRHDATA()

    Dim i As Long, Line As String, p As Long, guardar As Boolean
    'Dim SaveIni As clsIniManager

    'Set SaveIni = New clsIniManager
    'SaveIni.Initialize App.Path & "\Graficos.ini"
    'SaveIni.ChangeValue "Init", "NumGrh", UBound(GrhData())

    Call WriteVar(App.Path & "\Graficos.ini", "Init", "NumGrh", UBound(GrhData()))

    For i = LBound(GrhData()) To UBound(GrhData())

        With GrhData(i)
            Line = vbNullString

            If .NumFrames = 1 Then
                Line = "1-" & .FileNum & "-" & .Sx & "-" & .Sy & "-" & .pixelWidth & "-" & .pixelHeight
                Call WriteVar(App.Path & "\Graficos.ini", "Graphics", "Grh" & i, Line)
                'SaveIni.ChangeValue "Graphics", "Grh" & i, line
            ElseIf .NumFrames <> 1 And Not .NumFrames = 0 Then
                Line = .NumFrames & "-"

                For p = 1 To .NumFrames
                    Line = Line & .Frames(p) & "-"
                Next p

                Line = Line & .Speed
                Call WriteVar(App.Path & "\Graficos.ini", "Graphics", "Grh" & i, Line)
                'SaveIni.ChangeValue "Graphics", "Grh" & i, line

            End If

        End With

    Next i

    'SaveIni.DumpFile App.Path & "\Graficos.ini"

    ' Set SaveIni = Nothing
    MsgBox "Finish"

End Sub

Public Sub LogErrorPicture(ByRef Desc As String)

    Dim nFile As Integer
    nFile = FreeFile    ' obtenemos un canal
    Open App.Path & "\Logs\ErrPictures.log" For Append As #nFile
    Print #nFile, Desc
    Close #nFile

End Sub

Public Sub LogError(ByRef Desc As String)

    Dim nFile As Integer
    nFile = FreeFile    ' obtenemos un canal
    Open App.Path & "\Logs\Errores.log" For Append As #nFile
    Print #nFile, Desc
    Close #nFile

End Sub

Public Function getTagPosition(ByVal nick As String) As Integer

    Dim buf As Integer

    buf = InStr(nick, "<")

    If buf > 0 Then
        getTagPosition = buf
        Exit Function

    End If

    buf = InStr(nick, "[")

    If buf > 0 Then
        getTagPosition = buf
        Exit Function

    End If

    getTagPosition = Len(nick) + 2

End Function

Public Function IsGrhTree(ByVal GrhIndex As Long) As Boolean

    Dim i As Long
  
    For i = 1 To NumArboles

        If ListArboles(i) = GrhIndex Then
            IsGrhTree = True
            Exit Function

        End If

    Next i

End Function

Public Function cLoadPicture(ByVal FileName As String) As StdPicture

    If FileExist(FileName, vbNormal) Then
        Set cLoadPicture = LoadPicture(FileName)
        
    Else
        Set cLoadPicture = LoadPicture(vbNullString)
        Call LogErrorPicture("Imagen inexistente :" & FileName)

    End If

End Function

Public Sub DibujarMinimap()

    frmMiniMap.MiniMap.Picture = cLoadPicture(DirMiniMap & "Mapa" & UserMap & ".bmp")
    
End Sub

Sub SetTranslucent(ThehWnd As Long, nTrans As Integer)

    On Error GoTo ErrorRtn
 
    Dim attrib As Long
 
    'put current GWL_EXSTYLE in attrib
    attrib = GetWindowLong(ThehWnd, GWL_EXSTYLE)
 
    'change GWL_EXSTYLE to WS_EX_LAYERED - makes a window layered
    SetWindowLong ThehWnd, GWL_EXSTYLE, attrib Or WS_EX_LAYERED
 
    'Make transparent (RGB value does not have any effect at this
    'time, will in Part 2 of this article)
    SetLayeredWindowAttributes ThehWnd, RGB(0, 0, 0), nTrans, LWA_ALPHA
    Exit Sub
 
ErrorRtn:
    MsgBox Err.Description & " Source : " & Err.source
 
End Sub


Public Function SubClassControl(MySSTAB As Object, Pct As Object)
    Pct.AutoRedraw = True
    Pct.ScaleMode = vbPixels
    MySSTAB.BackColor = vbWhite
    
    'Save Grid fontname to use with DC's
    SetProp MySSTAB.hWnd, "lpPROC", SetWindowLong(MySSTAB.hWnd, GWL_WNDPROC, AddressOf MySubclassedGrid)
    SetProp MySSTAB.hWnd, "PctOBJ", ObjPtr(Pct)      'Save a pointer to PictureBox
    SetProp MySSTAB.hWnd, "GridOBJ", ObjPtr(MySSTAB)  'Save a pointer to Control
End Function

Public Sub UnSubClassControl(ByVal hw As Long)
    Dim retVal As Long
    retVal = SetWindowLong(hw, GWL_WNDPROC, GetProp(hw, "lpPROC")) 'unsubclass Control
    'Clean up windows database
    RemoveProp hw, "lpPROC"
    RemoveProp hw, "PctOBJ"
    RemoveProp hw, "GridOBJ"
End Sub

Private Function MySubclassedGrid(ByVal hw As Long, ByVal lMsg As Long, ByVal wParam As Long, ByVal lParam As Long) As Long
Dim PicTEMP         As Object
Dim PicBACKGROUND   As Object
Dim GridTEMP        As Object, GridREAL     As Object

    gHookHWND = hw
    
    'Make GridTEMP a illegal reference - do not press END - Crash
    CopyMemory GridTEMP, GetProp(hw, "GridOBJ"), 4
    
    'Make it legal
    Set GridREAL = GridTEMP

    'Destroy illegal - no more crash
    CopyMemory GridTEMP, 0&, 4

    'Same story for PicTEMP
    CopyMemory PicTEMP, GetProp(hw, "PctOBJ"), 4
    Set PicBACKGROUND = PicTEMP
    CopyMemory PicTEMP, 0&, 4

    Select Case lMsg
         Case Is = WM_PAINT
            
            'We must do all the painting job
            Dim controlDC As Long, tempDC As Long, intDC As Long, tempBMP, intBMP As Long
            Dim aPS As PAINTSTRUCT
            Dim aDC As Long
            Dim Altura As Long
            Dim tppX, tppY As Long
            Dim BackBuffDC, BackBuffBMP As Long
            
            GetClientRect hw, pRect
                        
            'Start painting control ...
            Call BeginPaint(hw, aPS)
                aDC = aPS.hdc 'store painting DC
                'Prepare Double buffering ...No flickering
                BackBuffDC = CreateCompatibleDC(aDC)
                BackBuffBMP = CreateCompatibleBitmap(aDC, pRect.Right, pRect.Bottom)
                DeleteObject SelectObject(BackBuffDC, BackBuffBMP)
                
                'This is the big thing ! We are sendind WM_PAINT to our backbuffer
                MySubclassedGrid = CallWindowProc(GetProp(hw, "lpPROC"), hw, lMsg, ByVal BackBuffDC, 0&)
                        
                With pRect
                    Call BitBlt(BackBuffDC, tppX, tppY, pRect.Right, pRect.Bottom, _
                         PicBACKGROUND.hdc, GridREAL.Left, GridREAL.Top, vbSrcAnd)
                End With
                
                'We have all the changes into backbuffer. Let's bring in back to control.hDc
                With aPS.rcPaint
                    BitBlt aDC, .Left, .Top, .Right - .Left, .Bottom - .Top, BackBuffDC, .Left, .Top, vbSrcCopy
                End With
                
                DeleteDC BackBuffDC
                DeleteObject BackBuffBMP
            Call EndPaint(hw, aPS)
            
            MySubclassedGrid = 0 'When a function intercepts WM_PAINT it must return 0
        Case Else
            'Call default windows procedure, stored in windows database in propertie lpPROC
            MySubclassedGrid = CallWindowProc(GetProp(hw, "lpPROC"), hw, lMsg, wParam, lParam)
    End Select
End Function




