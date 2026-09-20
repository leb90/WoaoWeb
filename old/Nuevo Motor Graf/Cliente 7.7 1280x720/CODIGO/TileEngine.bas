Attribute VB_Name = "Mod_TileEngine"
Option Explicit

'¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?
'¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?
'    C       O       N       S      T
'¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?
'¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?
'Map sizes in tiles
Public Const XMaxMapSize As Integer = 100
Public Const XMinMapSize As Integer = 1
Public Const YMaxMapSize As Integer = 100
Public Const YMinMapSize As Integer = 1

Public Const GrhFogata   As Integer = 1521

''
'Sets a Grh animation to loop indefinitely.
Public Const INFINITE_LOOPS As Integer = -1

'¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?
'¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?
'    T       I      P      O      S
'¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?
'¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?

'Posicion en un mapa
Public Type Position
    x As Integer
    y As Integer
End Type

'Posicion en el Mundo
Public Type WorldPos
    Map As Integer
    x As Integer
    y As Integer
End Type

'Contiene info acerca de donde se puede encontrar un grh
'tamaño y animacion
Public Type GrhData

    Sx As Integer
    Sy As Integer

    FileNum As Long

    pixelWidth As Integer
    pixelHeight As Integer

    TileWidth As Single
    TileHeight As Single

    NumFrames As Integer
    Frames() As Long

    Speed As Single
    Src As wGL_Rectangle

End Type

'apunta a una estructura grhdata y mantiene la animacion
Public Type Grh
    GrhIndex As Long
    FrameCounter As Single
    FrameTimer As Single
    Speed As Single
    Started As Byte
    Loops As Integer
    Alpha As Boolean

End Type

'Lista de cuerpos
'Pluto:2.11
Public Type BodyData
    Walk(1 To 8) As Grh
    HeadOffSet As Position
    Aura As Long
End Type

'Lista de Alas
Public Type AlasData
    AlasWalk(1 To 4) As Grh
    offset(1 To 4) As Position
    Aura As Long
End Type

'Lista de Botas
Public Type BotaData
    Walk(1 To 4) As Grh
    HeadOffSet As Position
    Aura As Long
End Type

'Lista de cabezas
Public Type HeadData
    Head(1 To 4) As Grh
    Aura As Long
End Type

'Lista de las animaciones de las armas
Type WeaponAnimData
    WeaponWalk(1 To 4) As Grh
    Aura As Long
End Type

'Lista de las animaciones de los escudos
Type ShieldAnimData
    ShieldWalk(1 To 4) As Grh
    Aura As Long
End Type

'Lista de cuerpos
Public Type FxData
    FX As Long
    OffsetX As Long
    OffsetY As Long

End Type

Public Enum AuraBody
    Alas = 1
    Arma = 2
    Botas = 3
    Casco = 4
    Cuerpo = 5
    Escudo = 6
End Enum
'aca guardo todos los personajes
Public allPjData As String

'Apariencia del personaje
Public Type Char

    Aura(AuraBody.Alas To AuraBody.Escudo) As Long

    Active As Byte
    Heading As Byte
    pos As Position
    ArmaAnim As Byte

    Botas As BotaData
    Body As BodyData
    Head As HeadData
    Casco As HeadData
    Arma As WeaponAnimData
    Alas As AlasData
    Escudo As ShieldAnimData
    
    UsandoArma As Boolean
    
    'pluto:2.10
    FxVida As Integer
    FxVidaCounter As Integer
    'pluto:6.0A
    
    isNpc As Boolean
    Raid As Byte

    FX As Grh
    FXIndex As Long ' GSZAO
    
    Criminal As Byte
    GM As Integer
    LiderHorda As Boolean
    LiderAlianza As Boolean
    legion As Integer
    
    Nombre As String
    NombreColor As Long
    Clan As String
    ClanColor As Long
    
    NumParty As Byte

    rReal As Byte
    Credito As Byte
    EsGoblin As Byte

    ScrollDirectionX As Integer
    ScrollDirectionY As Integer
    
    Moving As Byte
    MoveOffsetX As Single
    MoveOffsetY As Single
        
    Party As Byte

    pie As Boolean
    Muerto As Boolean
    invisible As Boolean
    iHead As Integer
    iBody As Integer
    VidaTotal As Long
    VidaActual As Long

End Type

'Info de un objeto
Public Type Obj
    ObjIndex As Integer
    Amount As Integer

End Type

'S.O.S
Type tMensajesSos
    Tipo As String
    Autor As String
    Contenido As String

End Type

Public MensajesSOS(1 To 120) As tMensajesSos
Public EsUsuario             As String
Public MensajesNumber        As Integer
Public TieneParaResponder    As Boolean
Public Stopped               As Byte

'Denuncias - nuevo
Type tDenuncias
    Tipo As String
    Autor As String
    Contenido As String
    YP As String
    id As String
    nick As String
    UltimoLogeo As String
    PrimerDenuncia As String
    UltimaDenuncia As String
    Estado As String

End Type

Public Denuncias(1 To 50) As tDenuncias
Public DenunciasNumber    As Integer

'Tipo de las celdas del mapa
Public Type MapBlock

    Graphic(1 To 4) As Grh
    CharIndex As Integer
    ObjGrh As Grh

    NPCIndex As Integer
    OBJInfo As Obj
    TileExit As WorldPos
    Blocked As Byte

    Trigger As Integer
    Color As Long

End Type

'Info de cada mapa
Public Type MapInfo
    Music As String
    Name As String
    StartPos As WorldPos
    MapVersion As Integer

End Type

Public Segura(1 To 303)      As Byte
Public luzaviso(1 To 303)    As Byte
Public Luzaviso2             As Integer

'Bordes del mapa
Public MinXBorder            As Byte
Public MaxXBorder            As Byte
Public MinYBorder            As Byte
Public MaxYBorder            As Byte

'Status del user
Public CurMap                As Long     'Mapa actual
Public AddtoUserPos          As Position    'Si se mueve
Public UserPos               As Position    'Posicion
Public UserIndex             As Integer
Public UserMoving            As Byte
Public UserBody              As Integer
Public UserHead              As Integer
Public UserCharIndex         As Integer
Public UserMaxAGU            As Integer
Public UserMinAGU            As Integer
Public UserMaxHAM            As Integer
Public UserMinHAM            As Integer
Public UserGuerra            As Boolean 'Guerras

Public EngineRun             As Boolean

'Tamaño del la vista en Tiles
Public WindowTileWidth       As Integer
Public WindowTileHeight      As Integer

Public HalfWindowTileHeight  As Integer
Public HalfWindowTileWidth   As Integer

'Cuantos tiles el engine mete en el BUFFER cuando
'dibuja el mapa. Ojo un tamaño muy grande puede
'volver el engine muy lento
Public TileBufferSize        As Integer
Public ScrollPixelsPerFrameX As Integer
Public ScrollPixelsPerFrameY As Integer

'Handle to where all the drawing is going to take place
Public DisplayFormhWnd       As Long

'Tamaño de los tiles en pixels
Public TilePixelHeight       As Integer
Public TilePixelWidth        As Integer

Public EngineBaseSpeed       As Single
Public FPS                   As Long
Public FPSX                   As Long
Public FramesPerSecCounter   As Long
Public FpsLastCheck          As Long

'Very percise counter 64bit system counter
Private Declare Function QueryPerformanceFrequency Lib "kernel32" (lpFrequency As Currency) As Long
Private Declare Function QueryPerformanceCounter Lib "kernel32" (lpPerformanceCount As Currency) As Long

'?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿Totales?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?
Public NumBodies            As Integer
Public NumHeads             As Integer
Public NumFxs               As Integer
Public NumOnline            As Integer
Public NumChars             As Integer
Public NumWeaponAnims       As Integer
Public NumShieldAnims       As Integer
Public LastChar             As Integer
Public GrhCount             As Long

'¿?¿?¿?¿?¿?¿?¿?¿?¿?¿Graficos¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?

''''''''''''''' DATOS CREAR CUENTA ''''''''''''''''
Public nombrePJ As String
Public nivelPJ As Byte
Public cabezaPJ As Integer
Public bodyPJ As Integer
Public escudoPJ As Integer
Public armaPJ As Integer
Public cascoPJ As Integer
Public clanPJ As String
Public clasePJ As String

''''''''''''''' DATOS CREAR CUENTA ''''''''''''''''

'¿?¿?¿?¿?¿?¿?¿?¿?¿?¿Graficos¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?
Public GrhData()            As GrhData            'Guarda todos los grh
Public BodyData()           As BodyData
Public HeadData()           As HeadData
Public FxData()             As FxData
Public WeaponAnimData()     As WeaponAnimData
Public ShieldAnimData()     As ShieldAnimData
Public CascoAnimData()      As HeadData
Public AlasAnimData()       As AlasData
Public BotaData()           As BotaData
'¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?

'¿?¿?¿?¿?¿?¿?¿?¿?¿?¿Mapa?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?
Public MapData()            As MapBlock    ' Mapa
Public MapInfo              As MapInfo            ' Info acerca del mapa en uso
'¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?

'¿?¿?¿?¿?¿?¿?¿?¿?¿?¿Usuarios?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?
Public CharList(1 To 10000) As Char
'¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?

Public Type Dimension

    Width   As Long
    Height  As Long

End Type

Public CharInStat        As Boolean
Public CharInCreation    As Boolean
Public CuentaLoginPJ     As Boolean
Public CharInPet         As Boolean

Public CreateCharDevice As Long
Public CreateCharDevicePJ As Long
Public StatsDevice      As Long
Public PetDevice        As Long

Public CreateCharDimension  As Dimension
Public CreateCharDimensionPJ  As Dimension
Public StatsDimension       As Dimension
Public PetDimension         As Dimension

Public Type Example

    Body As Grh
    Head As Grh
    HelmetPJ As Grh
    Shield As Grh
    Weapon As Grh
        
End Type

Public PetExample        As Example
Public CreateCharExample As Example
Public CreateCharExamplePJ As Example
Public StatsExample      As Example


'¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿API?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?
'Blt
Public Declare Function BitBlt Lib "gdi32" (ByVal hDestDC As Long, _
                                            ByVal x As Long, _
                                            ByVal y As Long, _
                                            ByVal nWidth As Long, _
                                            ByVal nHeight As Long, _
                                            ByVal hSrcDC As Long, _
                                            ByVal xSrc As Long, _
                                            ByVal ySrc As Long, _
                                            ByVal dwRop As Long) As Long
'¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?

'¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?
'       [CODE 000]: MatuX
'
Public bRain        As Boolean    'está raineando?
Public bTecho       As Boolean    'hay techo?

Private RLluvia(7)  As RECT    'RECT de la lluvia
Private iFrameIndex As Byte  'Frame actual de la LL
Private llTick      As Long    'Contador
Private LTLluvia(6) As Integer

'[CODE 001]:MatuX
Public Enum PlayLoop

    plNone = 0
    plLluviain = 1
    plLluviaout = 2
    plFogata = 3

End Enum

Public IsPlaying As Byte
  
'
'       [END]
'¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?¿?

Public Sub CargarAnimAlas()

    Dim i    As Long, NumAlasAnims As Integer, h As Long
    Dim Leer As clsIniManager, tmpInt As Long
    Set Leer = New clsIniManager

    Leer.Initialize DirInit & "alas.dat"

    NumAlasAnims = Val(Leer.GetValue("INIT", "NumAlas"))

    ReDim AlasAnimData(0 To NumAlasAnims) As AlasData

    For i = 1 To NumAlasAnims

        With AlasAnimData(i)
            .Aura = Val(Leer.GetValue("ALS" & CStr(i), "Aura"))

            For h = 1 To 4
                tmpInt = Val(Leer.GetValue("ALS" & CStr(i), "Dir" & CStr(h)))
                .offset(h).x = Val(Leer.GetValue("ALS" & CStr(i), "Dir" & CStr(h) & "PosX"))
                .offset(h).y = Val(Leer.GetValue("ALS" & CStr(i), "Dir" & CStr(h) & "PosY"))
                InitGrh .AlasWalk(h), tmpInt, 0
                
            Next h

        End With

    Next i

    Set Leer = Nothing

End Sub

Sub CargarCabezas()

    Dim i    As Long, NumHeads As Integer, h As Long
    Dim Leer As clsIniManager, tmpInt As Long
    Set Leer = New clsIniManager

    Leer.Initialize DirInit & "Cabezas.dat"

    'num de cabezas
    NumHeads = Leer.GetValue("Init", "NumHeads")

    'Resize array
    ReDim HeadData(0 To NumHeads) As HeadData

    For i = 1 To NumHeads

        With HeadData(i)
        
            For h = 1 To 4
                tmpInt = Val(Leer.GetValue("HEAD" & CStr(i), "Head" & CStr(h)))
                InitGrh .Head(h), tmpInt, 0
            Next h

        End With

    Next i

    Set Leer = Nothing

End Sub

Sub CargarCascos()

    Dim i    As Long, NumCascos As Integer, h As Long
    Dim Leer As clsIniManager, tmpInt As Long
    Set Leer = New clsIniManager

    Leer.Initialize DirInit & "Cascos.dat"

    'num de cascos
    NumCascos = Leer.GetValue("Init", "NumCascos")

    'Resize array
    ReDim CascoAnimData(0 To NumCascos) As HeadData

    For i = 1 To NumCascos

        With CascoAnimData(i)
     
            .Aura = Val(Leer.GetValue("CASCO" & CStr(i), "Aura"))

            For h = 1 To 4
                tmpInt = Val(Leer.GetValue("CASCO" & CStr(i), "Head" & CStr(h)))
                InitGrh .Head(h), tmpInt, 0
            Next h

        End With

    Next i

    Set Leer = Nothing

End Sub

Sub CargarCuerpos()

    Dim i    As Long, NumCuerpos As Integer, h As Long
    Dim Leer As clsIniManager, tmpInt As Long
    Set Leer = New clsIniManager

    Leer.Initialize DirInit & "Personajes.dat"

    'num de cabezas
    NumCuerpos = Leer.GetValue("Init", "NumBodies")

    'Resize array
    ReDim BodyData(0 To NumCuerpos) As BodyData

    For i = 1 To NumCuerpos

        With BodyData(i)
          
            For h = 1 To 8
                InitGrh .Walk(h), Val(Leer.GetValue("BODY" & CStr(i), "Walk" & h)), 0
            Next h

            .HeadOffSet.x = Val(Leer.GetValue("BODY" & CStr(i), "HeadOffsetX"))
            .HeadOffSet.y = Val(Leer.GetValue("BODY" & CStr(i), "HeadOffsetY"))
            .Aura = Val(Leer.GetValue("BODY" & CStr(i), "Aura"))

        End With

    Next i

    Set Leer = Nothing

End Sub

'[GAU]
Sub CargarBotas()

    Dim i    As Long, NumBotas As Integer, h As Long
    Dim Leer As clsIniManager, tmpInt As Long
    Set Leer = New clsIniManager

    Leer.Initialize DirInit & "Botas.dat"

    'num de cabezas
    NumBotas = Leer.GetValue("Init", "NumBotas")

    'Resize array
    ReDim BotaData(0 To NumBotas) As BotaData

    For i = 1 To NumBotas

        With BotaData(i)

            For h = 1 To 4
                tmpInt = Val(Leer.GetValue("BOTA" & CStr(i), "Walk" & CStr(h)))
                InitGrh .Walk(h), tmpInt, 0
            Next h

            .HeadOffSet.x = Val(Leer.GetValue("BOTA" & CStr(i), "HeadOffsetX"))
            .HeadOffSet.y = Val(Leer.GetValue("BOTA" & CStr(i), "HeadOffsetY"))
            .Aura = Val(Leer.GetValue("BOTA" & CStr(i), "Aura"))

        End With

    Next i

    Set Leer = Nothing

End Sub

Sub CargarAnimArmas()

    Dim i    As Long
    Dim Arch As String
    Arch = DirInit & "armas.dat"

    NumWeaponAnims = Val(GetVar(Arch, "INIT", "NumArmas"))

    ReDim WeaponAnimData(1 To NumWeaponAnims) As WeaponAnimData

    For i = 1 To NumWeaponAnims
     
        With WeaponAnimData(i)
            .Aura = Val(GetVar(Arch, "ARMA" & i, "Aura"))
            InitGrh .WeaponWalk(1), Val(GetVar(Arch, "ARMA" & i, "Dir1")), 0
            InitGrh .WeaponWalk(2), Val(GetVar(Arch, "ARMA" & i, "Dir2")), 0
            InitGrh .WeaponWalk(3), Val(GetVar(Arch, "ARMA" & i, "Dir3")), 0
            InitGrh .WeaponWalk(4), Val(GetVar(Arch, "ARMA" & i, "Dir4")), 0

        End With

    Next i

End Sub

Sub CargarAnimEscudos()

    Dim i    As Long
    Dim Arch As String
    Arch = DirInit & "escudos.dat"

    NumEscudosAnims = Val(GetVar(Arch, "INIT", "NumEscudos"))

    ReDim ShieldAnimData(1 To NumEscudosAnims) As ShieldAnimData

    For i = 1 To NumEscudosAnims
   
        With ShieldAnimData(i)
            .Aura = Val(GetVar(Arch, "ESC" & i, "Aura"))
            InitGrh .ShieldWalk(1), Val(GetVar(Arch, "ESC" & i, "Dir1")), 0
            InitGrh .ShieldWalk(2), Val(GetVar(Arch, "ESC" & i, "Dir2")), 0
            InitGrh .ShieldWalk(3), Val(GetVar(Arch, "ESC" & i, "Dir3")), 0
            InitGrh .ShieldWalk(4), Val(GetVar(Arch, "ESC" & i, "Dir4")), 0

        End With

    Next i

End Sub

'[GAU]
Sub CargarFxs()

    Dim i    As Long, NumCascos As Integer, h As Long
    Dim Leer As clsIniManager, tmpInt As Long
    Set Leer = New clsIniManager

    Leer.Initialize DirInit & "Fxs.dat"

    'num de cabezas
    NumFxs = Leer.GetValue("Init", "NumFxs")

    'Resize array
    ReDim FxData(0 To NumFxs) As FxData

    For i = 1 To NumFxs

        FxData(i).OffsetX = Val(Leer.GetValue("FX" & CStr(i), "OffsetX"))
        FxData(i).OffsetY = Val(Leer.GetValue("FX" & CStr(i), "OffsetY"))
        FxData(i).FX = Val(Leer.GetValue("FX" & CStr(i), "Animacion"))
    Next i

    Set Leer = Nothing

End Sub

Sub CargarArrayLluvia()

    On Error Resume Next

    Dim n  As Integer, i As Long
    Dim nu As Integer

    n = FreeFile
    Open DirInit & "fk.ind" For Binary Access Read As #n

    'cabecera
    Get #n, , MiCabecera

    'num de cabezas
    Get #n, , nu

    'Resize array
    ReDim bLluvia(1 To nu) As Byte

    For i = 1 To nu
        Get #n, , bLluvia(i)
    Next i

    Close #n

End Sub

Sub ConvertCPtoTP(ByVal viewPortX As Integer, ByVal viewPortY As Integer, ByRef tX As Integer, ByRef tY As Integer)

    '******************************************
    'Converts where the mouse is in the main window to a tile position. MUST be called eveytime the mouse moves.
    '******************************************
    tX = UserPos.x + viewPortX \ TilePixelWidth - WindowTileWidth \ 2
    tY = UserPos.y + viewPortY \ TilePixelHeight - WindowTileHeight \ 2

End Sub

Sub MakeChar(ByVal CharIndex As Integer, _
             ByVal Body As Integer, _
             ByVal Head As Integer, _
             ByVal Heading As Byte, _
             ByVal x As Integer, _
             ByVal y As Integer, _
             ByVal Arma As Integer, _
             ByVal Escudo As Integer, _
             ByVal Casco As Integer, _
             ByVal Botas As Integer, _
             ByVal Alas As Integer)

    'Apuntamos al ultimo Char
    If CharIndex > LastChar Then LastChar = CharIndex

    NumChars = NumChars + 1

    If Arma = 0 Then Arma = 2
    If Escudo = 0 Then Escudo = 2
    If Casco = 0 Then Casco = 2
    If Alas = 0 Then Alas = 2

    With CharList(CharIndex)
        .iBody = Body
        .iHead = Head

        .Head = HeadData(Head)
        
        .Body = BodyData(Body)
        .Aura(AuraBody.Cuerpo) = .Body.Aura
        
        .Arma = WeaponAnimData(Arma)
        .Aura(AuraBody.Arma) = .Arma.Aura
        
        .Alas = AlasAnimData(Alas)
        .Aura(AuraBody.Alas) = .Alas.Aura
        
        .Escudo = ShieldAnimData(Escudo)
        .Aura(AuraBody.Escudo) = .Escudo.Aura
        
        .Casco = CascoAnimData(Casco)
        .Aura(AuraBody.Casco) = .Casco.Aura
        
        .Botas = BotaData(Botas)
        .Aura(AuraBody.Botas) = .Botas.Aura

        .Heading = Heading

        'Reset moving stats
        .Moving = 0
        .MoveOffsetX = 0
        .MoveOffsetY = 0

        'Update position
        .pos.x = x
        .pos.y = y

        'Make active
        .Active = 1
        
        .isNpc = (.Raid > 0 Or Head = 2)
      
        'eze: Soporte, Denuncias
      
        If Len(.Nombre) > 0 And UserCharIndex > 0 Then
          
            If CharList(UserCharIndex).Nombre <> .Nombre Then
                Dim pos  As Integer
                Dim Line As String

                'Nick
                pos = InStr(.Nombre, "<")

                If pos = 0 Then pos = Len(.Nombre) + 2
                Line = Left$(.Nombre, pos - 2)
                
                'AGREGAMOS EL NICK AL FRM DENUNCIAS
                Dim aDenuncias As Long, aEncontro As Boolean
                aEncontro = False

                For aDenuncias = 0 To frmGM.lstVistos.ListCount - 1

                    If frmGM.lstVistos.List(aDenuncias) = Line Then
                        aEncontro = True

                    End If

                Next aDenuncias
                        
                If aEncontro = False And LenB(Line) <> 0 And Line <> " " Then
                    frmGM.lstVistos.AddItem Line

                End If

            End If

            'eze: Soporte, Denuncias
        End If
    
        Dim RangeX As Single, RangeY As Single
        Call GetCharacterDimension(CharIndex, RangeX, RangeY)
        Call g_Swarm.Insert(QuadTree.LAYER_CHAR, CharIndex, x, y, RangeX, RangeY)
    End With

    'Plot on map
    MapData(x, y).CharIndex = CharIndex

End Sub

Sub ResetCharInfo(ByVal CharIndex As Integer)


End Sub

Sub EraseChar(ByVal CharIndex As Integer)

    On Error Resume Next

    '*****************************************************************
    'Erases a character from CharList and map
    '*****************************************************************

    With CharList(CharIndex)
        .Active = 0

        'Update lastchar
        If CharIndex = LastChar Then

            Do Until CharList(LastChar).Active = 1
                LastChar = LastChar - 1
                If LastChar = 0 Then Exit Do
            Loop
        End If
        
        Call g_Swarm.Remove(QuadTree.LAYER_CHAR, CharIndex, 0, 0, 0, 0)
    
        'pluto:6.5
        If InMapBounds(.pos.x, .pos.y) Then
            MapData(.pos.x, .pos.y).CharIndex = 0
        End If
        
    End With

    'Remove char's dialog
    Call Dialogos.RemoveDialog(CharIndex)

    Dim ClearChar As Char
    CharList(CharIndex) = ClearChar

    'Update NumChars
    NumChars = NumChars - 1

End Sub

Public Sub InitGrh(ByRef Grh As Grh, ByVal GrhIndex As Long, Optional ByVal Started As Byte = 2, Optional ByVal Alpha As Boolean = False)

    '*****************************************************************
    'Sets up a grh. MUST be done before rendering
    '*****************************************************************

    If GrhIndex = 0 Then Exit Sub
    
    Grh.GrhIndex = GrhIndex

    If Started = 2 Then
        If GrhData(Grh.GrhIndex).NumFrames > 1 Then
            Grh.Started = 1
        Else
            Grh.Started = 0
        End If
    Else

        'Make sure the graphic can be started
        If GrhData(Grh.GrhIndex).NumFrames = 1 Then Started = 0
        Grh.Started = Started
    End If
    
    If Grh.Started Then
        Grh.Loops = INFINITE_LOOPS
    Else
        Grh.Loops = 0
    End If
    
    Grh.FrameCounter = 1
    Grh.FrameTimer = timerEngine
    Grh.Speed = GrhData(Grh.GrhIndex).Speed
    Grh.Alpha = Alpha

End Sub

Sub MoveCharbyHead(ByVal CharIndex As Integer, ByVal nHeading As E_Heading)

    '*****************************************************************
    'Starts the movement of a character in nHeading direction
    '*****************************************************************
    Dim addX As Integer
    Dim addY As Integer
    Dim x    As Integer
    Dim y    As Integer
    Dim nX   As Integer
    Dim nY   As Integer
    
    With CharList(CharIndex)
        x = .pos.x
        y = .pos.y

        'Figure out which way to move
        Select Case nHeading
            Case E_Heading.NORTH
                addY = -1
            Case E_Heading.EAST
                addX = 1
            Case E_Heading.SOUTH
                addY = 1
            Case E_Heading.WEST
                addX = -1
        End Select

        nX = x + addX
        nY = y + addY
            
        MapData(nX, nY).CharIndex = CharIndex
        .pos.x = nX
        .pos.y = nY
        
        If (MapData(x, y).CharIndex = CharIndex) Then
            MapData(x, y).CharIndex = 0
        End If
        
        Call g_Swarm.Move(CharIndex, nX, nY)

        .MoveOffsetX = -1 * (TilePixelWidth * addX)
        .MoveOffsetY = -1 * (TilePixelHeight * addY)

        .Moving = 1
        .Heading = nHeading
        
        Call InitGrh(.Body.Walk(.Heading), .Body.Walk(.Heading).GrhIndex, 1)
        Call InitGrh(.Alas.AlasWalk(.Heading), .Alas.AlasWalk(.Heading).GrhIndex, 1)
        Call InitGrh(.Botas.Walk(.Heading), .Botas.Walk(.Heading).GrhIndex, 1)
        
        If (Not .UsandoArma) Then
            Call InitGrh(.Arma.WeaponWalk(.Heading), .Arma.WeaponWalk(.Heading).GrhIndex, 1)
            Call InitGrh(.Escudo.ShieldWalk(.Heading), .Escudo.ShieldWalk(.Heading).GrhIndex, 1)

        End If
        
        .ScrollDirectionX = addX
        .ScrollDirectionY = addY

    End With

    If UserEstado = 0 Then Call DoPasosFx(CharIndex)
    
End Sub

Public Sub DoFogataFx()
 
    If bFogata Then
        bFogata = HayFogata()

        If Not bFogata Then
            Call Audio.StopWave(SoundFogataIndex)
            SoundFogataIndex = 0

        End If

    Else
        bFogata = HayFogata()

        If bFogata And SoundFogataIndex = 0 Then
            SoundFogataIndex = Audio.PlayWave("fuego.wav", True)

        End If

    End If

End Sub

Function EstaPCarea(ByVal CharIndex As Integer) As Boolean

    With CharList(CharIndex).pos
    
        EstaPCarea = .x > UserPos.x - MinXBorder And .x < UserPos.x + MinXBorder And .y > UserPos.y - MinYBorder And .y < UserPos.y + MinYBorder

    End With

End Function

Sub DoPasosFx(ByVal CharIndex As Integer)

    Dim GrhIndex As Long

    If Not UserNavegando Then

        'pluto:7.0
        With CharList(CharIndex)

            'If .invisible = True And .EsGoblin = 1 And RandomNumber(1, 100) > 60 Then Exit Sub

            If Not .Muerto And EstaPCarea(CharIndex) Then
                .pie = Not .pie
                GrhIndex = MapData(.pos.x, .pos.y).Graphic(1).GrhIndex

                '''''''''' lelepasos
                If GrhIndex >= 6000 And GrhIndex <= 6559 Then

                    If .pie Then
                        Call Audio.PlayWave("201.Wav")    '''pasto!
                    Else
                        Call Audio.PlayWave("202.Wav")    '''pasto!

                    End If

                ElseIf GrhIndex >= 20000 And GrhIndex <= 20015 Then

                    If .pie Then
                        Call Audio.PlayWave("199.wav")    'nieve
                    Else
                        Call Audio.PlayWave("200.wav")    'nieve

                    End If

                ElseIf GrhIndex >= 7700 And GrhIndex <= 7720 Then

                    If .pie Then
                        Call Audio.PlayWave("197.Wav")    'arena
                    Else
                        Call Audio.PlayWave("198.Wav")    'arena

                    End If

                Else

                    If .pie Then
                        Call Audio.PlayWave(SND_PASOS1)    ' normal
                    Else
                        Call Audio.PlayWave(SND_PASOS2)    ' normal

                    End If

                End If

            End If
        
        End With

    Else
        Call Audio.PlayWave(SND_NAVEGANDO)

    End If

End Sub

Sub MoveCharbyPos(ByVal CharIndex As Integer, ByVal nX As Integer, ByVal nY As Integer)

    Dim x        As Integer
    Dim y        As Integer
    Dim addX     As Integer
    Dim addY     As Integer
    Dim nHeading As E_Heading
    Dim i        As Long

    With CharList(CharIndex)
        x = .pos.x
        y = .pos.y

        If (MapData(x, y).CharIndex = CharIndex) Then
            MapData(x, y).CharIndex = 0
        End If
        
        addX = nX - x
        addY = nY - y

        If Sgn(addX) = 1 Then
            nHeading = E_Heading.EAST
        ElseIf Sgn(addX) = -1 Then
            nHeading = E_Heading.WEST
        ElseIf Sgn(addY) = -1 Then
            nHeading = E_Heading.NORTH
        ElseIf Sgn(addY) = 1 Then
            nHeading = E_Heading.SOUTH
        End If

        MapData(nX, nY).CharIndex = CharIndex
        
        .pos.x = nX
        .pos.y = nY
        
        Call g_Swarm.Move(CharIndex, nX, nY)
         
        .MoveOffsetX = -1 * (TilePixelWidth * addX)
        .MoveOffsetY = -1 * (TilePixelHeight * addY)
        
        .Moving = 1
        .Heading = nHeading
        
        Call InitGrh(.Body.Walk(.Heading), .Body.Walk(.Heading).GrhIndex, 1)
        Call InitGrh(.Alas.AlasWalk(.Heading), .Alas.AlasWalk(.Heading).GrhIndex, 1)
        Call InitGrh(.Botas.Walk(.Heading), .Botas.Walk(.Heading).GrhIndex, 1)

        If (Not .UsandoArma) Then
            Call InitGrh(.Arma.WeaponWalk(.Heading), .Arma.WeaponWalk(.Heading).GrhIndex, 1)
            Call InitGrh(.Escudo.ShieldWalk(.Heading), .Escudo.ShieldWalk(.Heading).GrhIndex, 1)

        End If
        
        .ScrollDirectionX = Sgn(addX)
        .ScrollDirectionY = Sgn(addY)
                
        'pluto:6.5
        If Party.numMiembros > 0 Then
            For i = 1 To Party.numMiembros
                If Party.Miembros(i).Index = CharIndex Then
                    Party.Miembros(i).x = .pos.x
                    Party.Miembros(i).y = .pos.y
                    Exit For
                End If
            Next
        End If
        
    End With

    If Not EstaPCarea(CharIndex) Then Call Dialogos.RemoveDialog(CharIndex)

End Sub

Sub MoveScreen(ByVal Heading As E_Heading)

    '******************************************
    'Starts the screen moving in a direction
    '******************************************
    Dim x  As Integer
    Dim y  As Integer
    Dim tX As Integer
    Dim tY As Integer

    'Figure out which way to move
    Select Case Heading

        Case E_Heading.NORTH
            y = -1

        Case E_Heading.EAST
            x = 1

        Case E_Heading.SOUTH
            y = 1

        Case E_Heading.WEST
            x = -1

    End Select

    'Fill temp pos
    tX = UserPos.x + x
    tY = UserPos.y + y

    'Check to see if its out of bounds
    If tX < MinXBorder Or tX > MaxXBorder Or tY < MinYBorder Or tY > MaxYBorder Then
        Exit Sub
    Else
        'Start moving... MainLoop does the rest
        AddtoUserPos.x = x
        AddtoUserPos.y = y
        
        UserPos.x = tX
        UserPos.y = tY
        
        UserMoving = 1
        
        bTecho = IIf(MapData(UserPos.x, UserPos.y).Trigger = 1 Or MapData(UserPos.x, UserPos.y).Trigger = 2 Or MapData(UserPos.x, _
                UserPos.y).Trigger = 4, True, False)
        
    End If

End Sub

Function HayFogata() As Boolean

    Dim j As Integer, k As Integer

    For j = UserPos.x - 12 To UserPos.x + 12
        For k = UserPos.y - 8 To UserPos.y + 8

            If InMapBounds(j, k) Then

                If MapData(j, k).ObjGrh.GrhIndex = GrhFogata Then
                    HayFogata = True
                    Exit Function

                End If

            End If

        Next k
    Next j

End Function

Function LoadGrhData() As Boolean

    '*****************************************************************
    'Loads Grh.dat
    '*****************************************************************

    Dim Grh         As Long
    Dim Frame       As Long
    Dim handle      As Integer
    Dim fileVersion As Long

    'Open files
    handle = FreeFile()
    Open DirInit & "Graficos.ind" For Binary Access Read As handle
    Seek handle, 1
    Get handle, , fileVersion
    Get handle, , GrhCount

    ReDim GrhData(0 To GrhCount) As GrhData

    While Not EOF(handle)

        Get handle, , Grh

        If Grh <> 0 Then

            With GrhData(Grh)

                Get handle, , .NumFrames

                If .NumFrames <= 0 Then GoTo ErrorHandler

                ReDim .Frames(1 To .NumFrames) As Long

                If .NumFrames > 1 Then

                    For Frame = 1 To .NumFrames
                        Get handle, , .Frames(Frame)

                        If .Frames(Frame) <= 0 Or .Frames(Frame) > GrhCount Then

                            GoTo ErrorHandler

                        End If

                    Next Frame

                    Get handle, , .Speed
                    .Speed = .NumFrames * 1000 / 18

                    If .Speed <= 0 Then GoTo ErrorHandler

                    .pixelHeight = GrhData(.Frames(1)).pixelHeight

                    If .pixelHeight <= 0 Then GoTo ErrorHandler

                    .pixelWidth = GrhData(.Frames(1)).pixelWidth

                    If .pixelWidth <= 0 Then GoTo ErrorHandler

                    .TileWidth = GrhData(.Frames(1)).TileWidth

                    If .TileWidth <= 0 Then GoTo ErrorHandler

                    .TileHeight = GrhData(.Frames(1)).TileHeight

                    If .TileHeight <= 0 Then GoTo ErrorHandler
                Else
                    Get handle, , .FileNum

                    If .FileNum <= 0 Then GoTo ErrorHandler

                    Get handle, , .Sx

                    If .Sx < 0 Then GoTo ErrorHandler

                    Get handle, , .Sy

                    If .Sy < 0 Then GoTo ErrorHandler

                    Get handle, , .pixelWidth

                    If .pixelWidth <= 0 Then GoTo ErrorHandler

                    Get handle, , .pixelHeight

                    If .pixelHeight <= 0 Then GoTo ErrorHandler
                    
                    Get handle, , .Src.X1
                    Get handle, , .Src.Y1
                    Get handle, , .Src.X2
                    Get handle, , .Src.Y2

                    .TileWidth = .pixelWidth / TilePixelHeight
                    .TileHeight = .pixelHeight / TilePixelWidth

                    .Frames(1) = Grh

                End If

            End With

        End If

    Wend

    Close handle

    If Navida = 1 Then Call navidad

    If SinTecho = 1 Then Call Sintechos

    LoadGrhData = True
    Exit Function
    
ErrorHandler:
    LoadGrhData = False

End Function

Function LegalPos(ByVal x As Integer, ByVal y As Integer) As Boolean

    '*****************************************************************
    'Checks to see if a tile position is legal
    '*****************************************************************
    LegalPos = False

    'Limites del mapa
    If x < MinXBorder Or x > MaxXBorder Or y < MinYBorder Or y > MaxYBorder Then
        Exit Function

    End If

    'Tile Bloqueado?
    If MapData(x, y).Blocked = 1 Then
        Exit Function

    End If

    '¿Hay un personaje?
    If MapData(x, y).CharIndex > 0 Then
        Exit Function
    
    End If

    If UserNavegando <> HayAgua(x, y) Then
        Exit Function

    End If

    LegalPos = True

End Function

Function InMapLegalBounds(ByVal x As Integer, ByVal y As Integer) As Boolean

    '*****************************************************************
    'Checks to see if a tile position is in the maps
    'LEGAL/Walkable bounds
    '*****************************************************************

    If x < MinXBorder Or x > MaxXBorder Or y < MinYBorder Or y > MaxYBorder Then
        InMapLegalBounds = False
        Exit Function

    End If

    InMapLegalBounds = True

End Function

Function InMapBounds(ByVal x As Integer, ByVal y As Integer) As Boolean

    '*****************************************************************
    'Checks to see if a tile position is in the maps bounds
    '*****************************************************************

    If x < XMinMapSize Or x > XMaxMapSize Or y < YMinMapSize Or y > YMaxMapSize Then
        InMapBounds = False
        Exit Function

    End If

    InMapBounds = True

End Function

Sub DrawGrhToIndex(ByVal GrhIndex As Long, _
                   ByVal x As Long, _
                   ByVal y As Long, _
                   ByVal Z As Single, _
                   ByVal Center As Byte, _
                   ByVal Color As Long, _
                   Optional ByVal Angle As Single = 0, _
                   Optional ByVal Alpha As Boolean = False)

        '<EhHeader>
        On Error GoTo DrawGrhToIndex_Err

        '</EhHeader>

100     With GrhData(GrhIndex)
            'Center Grh over X,Y pos
102         If Center Then
                'hard coded for speed
104             If .TileWidth <> 1 Then x = x - Int(.TileWidth * 16) + 16
106             If .TileHeight <> 1 Then y = y - Int(.TileHeight * 32) + 32
            End If
108         wGl_Render_Texture .FileNum, x, y, Z, .pixelWidth, .pixelHeight, .Src, Color, Angle, Alpha
        End With

        '<EhFooter>
        Exit Sub

DrawGrhToIndex_Err:
        Call LogError(Err.Description & " in Cliente.Mod_TileEngine.DrawGrhToIndex at line " & Erl)

        Resume Next

        '</EhFooter>
End Sub

Sub DrawGrhtoSurface(ByRef Grh As Grh, _
                     ByVal x As Single, _
                     ByVal y As Single, _
                     ByVal Z As Single, _
                     ByVal Center As Byte, _
                     ByVal Animate As Byte, _
                     ByVal Color As Long, _
                     Optional ByVal killAtEnd As Byte = 1, _
                     Optional ByVal Angle As Single = 0, _
                     Optional ByVal Alpha As Boolean = False)
        '<EhHeader>
        On Error GoTo DrawGrhtoSurface_Err
        '</EhHeader>

        '*****************************************************************
        'Draws a GRH transparently to a X and Y position
        '*****************************************************************
        Dim iGrhIndex As Long
    
100     If Grh.GrhIndex = 0 Then Exit Sub

102     If Animate Then

104         If Grh.Started = 1 Then
106             Grh.FrameCounter = Grh.FrameCounter + ((timerEngine - Grh.FrameTimer) * GrhData(Grh.GrhIndex).NumFrames / Grh.Speed)
108             Grh.FrameTimer = timerEngine

110             If Grh.FrameCounter > GrhData(Grh.GrhIndex).NumFrames Then
112                 Grh.FrameCounter = (Grh.FrameCounter Mod GrhData(Grh.GrhIndex).NumFrames) + 1
        
114                 If Grh.Loops <> INFINITE_LOOPS Then

116                     If Grh.Loops > 0 Then
118                         Grh.Loops = Grh.Loops - 1
                        Else
120                         Grh.Started = 0

122                         If killAtEnd Then Exit Sub

                        End If

                    End If

                End If

            End If

        End If

        'Figure out what frame to draw (always 1 if not animated)
124     iGrhIndex = GrhData(Grh.GrhIndex).Frames(Grh.FrameCounter)

126     With GrhData(iGrhIndex)

            'Center Grh over X,Y pos
128         If Center Then
130             If .TileWidth <> 1 Then x = x - Int(.TileWidth * 16) + 16               'hard coded for speed
132             If .TileHeight <> 1 Then y = y - Int(.TileHeight * 32) + 32               'hard coded for speed
            End If

134         wGl_Render_Texture .FileNum, x, y, Z, .pixelWidth, .pixelHeight, .Src, Color, Angle, Alpha

        End With

        '<EhFooter>
        Exit Sub

DrawGrhtoSurface_Err:
        Call LogError(Err.Description & " in Cliente.Mod_TileEngine.DrawGrhtoSurface at line " & Erl)
        Resume Next
        '</EhFooter>
End Sub

Private Sub CharRender(ByVal CharIndex As Long, ByVal PixelOffsetX As Integer, ByVal PixelOffsetY As Integer, ByVal Color As Long)
        '<EhHeader>
        On Error GoTo CharRender_Err
        '</EhHeader>
             
        Dim Moved    As Boolean
        Dim attacked As Boolean
        Dim i        As Long
        Dim x        As Integer, y As Integer
    
100     With CharList(CharIndex)
102         x = .pos.x
104         y = .pos.y

            'If needed, move left and right
106         If .Moving Then

                'If needed, move left and right
108             If .ScrollDirectionX <> 0 Then
110                 .MoveOffsetX = .MoveOffsetX + ScrollPixelsPerFrameX * Sgn(.ScrollDirectionX) * TimerTicksPerFrame
              
112                 Moved = True
            
                    'Check if we already got there
114                 If (Sgn(.ScrollDirectionX) = 1 And .MoveOffsetX >= 0) Or (Sgn(.ScrollDirectionX) = -1 And .MoveOffsetX <= 0) Then
116                     .MoveOffsetX = 0
118                     .ScrollDirectionX = 0

                    End If

                End If

                'If needed, move up and down
120             If .ScrollDirectionY <> 0 Then
122                 .MoveOffsetY = .MoveOffsetY + ScrollPixelsPerFrameY * Sgn(.ScrollDirectionY) * TimerTicksPerFrame
               
124                 Moved = True

                    'Check if we already got there
126                 If (Sgn(.ScrollDirectionY) = 1 And .MoveOffsetY >= 0) Or (Sgn(.ScrollDirectionY) = -1 And .MoveOffsetY <= 0) Then
128                     .MoveOffsetY = 0
130                     .ScrollDirectionY = 0

                    End If

                End If

            End If

132         If .ArmaAnim > 1 And .Moving = 0 Then
134             .ArmaAnim = .ArmaAnim - 1

136             If .ArmaAnim = 1 Then .Moving = 1

            End If
        
            'pluto:2.4.1 quitar esto
138         If .Heading = 0 Then .Heading = 3

140         If .UsandoArma And (.Arma.WeaponWalk(.Heading).Started Or .Escudo.ShieldWalk(.Heading).Started) Then
142             attacked = True
            
                Call InitGrh(.Arma.WeaponWalk(.Heading), .Arma.WeaponWalk(.Heading).GrhIndex, 0, False)
            
                Call InitGrh(.Escudo.ShieldWalk(.Heading), .Escudo.ShieldWalk(.Heading).GrhIndex, 0, False)
            
                .Arma.WeaponWalk(.Heading).Started = 1
                .Escudo.ShieldWalk(.Heading).Started = 1
                .UsandoArma = False
                
            End If
 
            'If done moving stop animation
144         If Not Moved And .Moving = 1 Then
            
146             .Body.Walk(.Heading).FrameTimer = timerEngine
148             .Body.Walk(.Heading).FrameCounter = 1
150             .Body.Walk(.Heading).Started = 0

152
154             .Arma.WeaponWalk(.Heading).FrameTimer = timerEngine
156             .Arma.WeaponWalk(.Heading).FrameCounter = 1
158             .Arma.WeaponWalk(.Heading).Started = 0
            
160             .Escudo.ShieldWalk(.Heading).FrameTimer = timerEngine
162             .Escudo.ShieldWalk(.Heading).FrameCounter = 1
164             .Escudo.ShieldWalk(.Heading).Started = 0
166

                

168             .Alas.AlasWalk(.Heading).FrameTimer = timerEngine
170             .Alas.AlasWalk(.Heading).FrameCounter = 1
172             .Alas.AlasWalk(.Heading).Started = 0
            
174             .Botas.Walk(.Heading).FrameTimer = timerEngine
176             .Botas.Walk(.Heading).FrameCounter = 1
178             .Botas.Walk(.Heading).Started = 0
            
180             .Body.Walk(.Heading + 4).FrameTimer = timerEngine
182             .Body.Walk(.Heading + 4).FrameCounter = 1
184             .Body.Walk(.Heading + 4).Started = 0
            
186             .Moving = 0
                 
            End If
        
            'Dibuja solamente players
188         PixelOffsetX = PixelOffsetX + .MoveOffsetX
190         PixelOffsetY = PixelOffsetY + .MoveOffsetY
        
            Dim xx      As Integer
            Dim ZZ      As Integer
        
            Dim SeeChar As Boolean
        
            'SeeChar = Not .invisible
            'SeeChar = SeeChar Or CharIndex = UserCharIndex
            'SeeChar = SeeChar Or (LenB(.Clan) > 0 And .Clan = CharList(UserCharIndex).Clan)
            'SeeChar = SeeChar Or (.NumParty > 0 And .NumParty = CharList(UserCharIndex).NumParty)
            'SeeChar = SeeChar Or (.rReal > 0 And .rReal = CharList(UserCharIndex).rReal And (CurMap < 166 Or CurMap > 169 And CurMap <> 185))
            '(.rReal = 1 and .rReal = CharList(UserCharIndex).rReal And (CurMap < 166 Or CurMap > 169 And CurMap <> 185))

192         SeeChar = Not .invisible

194         If UserCharIndex > 0 Then
196             SeeChar = SeeChar Or CharIndex = UserCharIndex

198             If CharList(UserCharIndex).GM = 0 Then
200                 SeeChar = SeeChar Or (LenB(.Clan) > 0 And .Clan = CharList(UserCharIndex).Clan)
202                 SeeChar = SeeChar Or (.NumParty > 0 And .NumParty = CharList(UserCharIndex).NumParty)
204                 'SeeChar = SeeChar Or (.rReal > 0 And .rReal = CharList(UserCharIndex).rReal And (CurMap < 166 Or CurMap > 169 And CurMap <> 185))
                Else
206                 SeeChar = True

                End If

            End If

208         If Not .isNpc Then

210             If SeeChar Then
                            
212                 For i = AuraBody.Alas To AuraBody.Escudo
                
214                     If .Aura(i) > 0 Then
216                         Call DrawGrhToIndex(.Aura(i), PixelOffsetX, PixelOffsetY + 31, wGl_Depth(3, x, y, 4), 1, -1, , True)

                        End If
                    
218                 Next i

220                 If .iBody >= PrimerBodyBarco And .iBody <= UltimoBodyBarco Then

222                     If .Body.Walk(.Heading).GrhIndex Then
224                         Call DrawGrhtoSurface(.Body.Walk(.Heading), PixelOffsetX, PixelOffsetY, wGl_Depth(3, x, y, 4), 1, 1, Color, 0, , True)

                        End If

                    Else
               
                        'Draw Alas
226                     If .Alas.AlasWalk(.Heading).GrhIndex Then
228                         Call DrawGrhtoSurface(.Alas.AlasWalk(.Heading), PixelOffsetX + .Alas.offset(.Heading).x, PixelOffsetY + .Alas.offset(.Heading).y - xx - GetOffSetMontura(.Body.HeadOffSet.y), wGl_Depth(3, x, y, 3), 1, 1, Color, 0, , True)

                        End If
                        
                        '[CUERPO]'
230                     If .Body.Walk(.Heading).GrhIndex Then
232                         Call DrawGrhtoSurface(.Body.Walk(.Heading), PixelOffsetX, PixelOffsetY, wGl_Depth(3, x, y, 4), 1, 1, Color, 0, , True)

                        End If

234                     If .Botas.Walk(.Heading).GrhIndex Then
236                         Call DrawGrhtoSurface(.Botas.Walk(.Heading), PixelOffsetX, PixelOffsetY, wGl_Depth(3, x, y, 4), 1, 1, Color, , , True)

                        End If


238                     If .Head.Head(.Heading).GrhIndex Then
240                         Call DrawGrhtoSurface(.Head.Head(.Heading), PixelOffsetX + .Body.HeadOffSet.x, PixelOffsetY + .Body.HeadOffSet.y, wGl_Depth(3, x, y, 5), 1, 0, Color, , , True)

                        End If

                        '[Casco]'
242                     If .Casco.Head(.Heading).GrhIndex Then
244                         Call DrawGrhtoSurface(.Casco.Head(.Heading), PixelOffsetX + .Body.HeadOffSet.x, PixelOffsetY + .Body.HeadOffSet.y - 34, wGl_Depth(3, x, y, 6), 1, 0, Color, , , True)

                        End If
               
                        '[ARMA]'
246                     If .Arma.WeaponWalk(.Heading).GrhIndex Then

                            'pluto:2.17-------------
248                         If .Arma.WeaponWalk(.Heading).GrhIndex = 19431 Then
250                             xx = 20
252                             ZZ = 45

                            End If

254                         If .Arma.WeaponWalk(.Heading).GrhIndex = 19424 Then
256                             xx = 30
258                             ZZ = 5

                            End If

                            
                            
        
260                         Call DrawGrhtoSurface(.Arma.WeaponWalk(.Heading), PixelOffsetX + ZZ, PixelOffsetY - xx - GetOffSetMontura(.Body.HeadOffSet.y), wGl_Depth(3, x, y, 5), 1, 1, Color, 0, , True)


                        End If

                        '[Escudo]'
262                     If .Escudo.ShieldWalk(.Heading).GrhIndex Then
264                         Call DrawGrhtoSurface(.Escudo.ShieldWalk(.Heading), PixelOffsetX, PixelOffsetY - xx - GetOffSetMontura(.Body.HeadOffSet.y), wGl_Depth(3, x, y, 6), 1, 1, Color, 0, , True)

                        End If
                
                    End If

266                 If Nombres Then
          
                        'pluto:6.2---------
268                     If Macreando = 1 Then

270                         If .Nombre = CharList(UserCharIndex).Nombre Then
272                             Call wGl_Draw_Text_Z(0, 15, PixelOffsetX + TilePixelWidth \ 2, PixelOffsetY + 15, wGl_Depth(3, x, y, 7), ARGB(50, 175, 25, 255), FONT_ALIGNMENT_TOP Or FONT_ALIGNMENT_CENTER, "Macro Activado")

                            End If

                        End If
                    
274                     If LenB(.Nombre) > 0 Then
276                         Call wGl_Draw_Text_Z(0, 15, PixelOffsetX + TilePixelWidth \ 2, PixelOffsetY + 30, wGl_Depth(3, x, y, 7), .NombreColor, FONT_ALIGNMENT_TOP Or FONT_ALIGNMENT_CENTER, .Nombre)
                            Call wGl_Draw_Text_Z(0, 15, PixelOffsetX + 1 + TilePixelWidth \ 2, PixelOffsetY + 29, wGl_Depth(2, x, y, 5), ARGB(1, 1, 1, 255), FONT_ALIGNMENT_TOP Or FONT_ALIGNMENT_CENTER, .Nombre)

                        End If
         
278                     If LenB(.Clan) <> 0 Then
280                         Call wGl_Draw_Text_Z(0, 15, PixelOffsetX + TilePixelWidth \ 2, PixelOffsetY + 45, wGl_Depth(3, x, y, 7), .ClanColor, FONT_ALIGNMENT_TOP Or FONT_ALIGNMENT_CENTER, "<" & .Clan & ">")
                            Call wGl_Draw_Text_Z(0, 15, PixelOffsetX + 1 + TilePixelWidth \ 2, PixelOffsetY + 44, wGl_Depth(2, x, y, 5), ARGB(1, 1, 1, 255), FONT_ALIGNMENT_TOP Or FONT_ALIGNMENT_CENTER, "<" & .Clan & ">")

                        End If

                    End If

                End If    'quitar para gm

            Else    '<-> If .Head.Head(.Heading).GrhIndex <> 0 Then

                Dim xyx As Byte

282             If .Body.Walk(5).Started = 0 And .Body.Walk(6).Started = 0 And .Body.Walk(7).Started = 0 And .Body.Walk(8).Started = 0 Then
284                 xyx = 0
                Else
286                 xyx = 4

                End If

288             If SeeChar Then

290                 If .Body.Walk(.Heading + xyx).GrhIndex Then
292                     Call DrawGrhtoSurface(.Body.Walk(.Heading + xyx), PixelOffsetX, PixelOffsetY, wGl_Depth(3, x, y, 4), 1, 1, Color, 0, , True)

                    End If

                End If

294             If Nombres Then
          
                    'pluto:6.2---------
296                 If Macreando = 1 Then

298                     If .Nombre = CharList(UserCharIndex).Nombre Then
300                         Call wGl_Draw_Text_Z(0, 15, PixelOffsetX + TilePixelWidth \ 2, PixelOffsetY + 15, wGl_Depth(3, x, y, 7), ARGB(50, 175, 25, 255), FONT_ALIGNMENT_TOP Or FONT_ALIGNMENT_CENTER, "Macro Activado")

                        End If

                    End If
                    
302                 If LenB(.Nombre) > 0 Then
304                     Call wGl_Draw_Text_Z(0, 15, PixelOffsetX + TilePixelWidth \ 2, PixelOffsetY + 30, wGl_Depth(3, x, y, 7), .NombreColor, FONT_ALIGNMENT_TOP Or FONT_ALIGNMENT_CENTER, .Nombre)
                        Call wGl_Draw_Text_Z(0, 15, PixelOffsetX + 1 + TilePixelWidth \ 2, PixelOffsetY + 29, wGl_Depth(2, x, y, 5), ARGB(1, 1, 1, 255), FONT_ALIGNMENT_TOP Or FONT_ALIGNMENT_CENTER, .Nombre)

                    End If
         
306                 If LenB(.Clan) <> 0 Then
308                     Call wGl_Draw_Text_Z(0, 15, PixelOffsetX + TilePixelWidth \ 2, PixelOffsetY + 45, wGl_Depth(3, x, y, 7), .ClanColor, FONT_ALIGNMENT_TOP Or FONT_ALIGNMENT_CENTER, .Clan)
                        Call wGl_Draw_Text_Z(0, 15, PixelOffsetX + 1 + TilePixelWidth \ 2, PixelOffsetY + 44, wGl_Depth(2, x, y, 5), ARGB(1, 1, 1, 255), FONT_ALIGNMENT_TOP Or FONT_ALIGNMENT_CENTER, .Clan)

                    End If

                End If

                '---------------------------------------

            End If    ' if IsNpc then
            
            'Update dialogs
310         Call Dialogos.UpdateDialogPos(PixelOffsetX + TilePixelWidth \ 2, PixelOffsetY + .Body.HeadOffSet.y - 34 / 2, 0#, CharIndex)

            'pluto:2.10

312         If .FxVida > 0 Then

314             If .FxVidaCounter > 0 Then
                    Dim YMove As Integer
                    Dim CRojo As Byte
316                 YMove = Int(PixelOffsetY + .FxVidaCounter) - 40
318                 CRojo = 255 - Int((40 - .FxVidaCounter) * 3)
           
320                 Call wGl_Draw_Text_Z(0, 15, PixelOffsetX + 10, YMove, wGl_Depth(3, x, y, 7), ARGB(CRojo, 0, 0, 255), FONT_ALIGNMENT_TOP Or FONT_ALIGNMENT_CENTER, Val(.FxVida))
                            
322                 .FxVidaCounter = .FxVidaCounter - 1

324                 If .FxVidaCounter < 1 Then
326                     .FxVidaCounter = 0
328                     .FxVida = 0

                    End If

                End If

            End If

            'pluto:6.0A
330         If .Raid > 0 Then
                Dim Vi As String
                Dim Vo As Long
332             Vo = Int((.VidaActual * 12) / .VidaTotal)
334             Vi = String$(Vo, "_")
336             Call wGl_Draw_Text_Z(0, 12, PixelOffsetX - 10, PixelOffsetY + 30, 0#, ARGB(175, 185, 55, 255), FONT_ALIGNMENT_CENTER, "MONSTER DRAG")
338             Call wGl_Draw_Text_Z(0, 12, PixelOffsetX - 10, PixelOffsetY + 35, 0#, ARGB(125, 18, 2, 255), FONT_ALIGNMENT_CENTER, Vi)
340             Call wGl_Draw_Text_Z(0, 12, PixelOffsetX - 10, PixelOffsetY + 37, 0#, ARGB(242, 32, 5, 255), FONT_ALIGNMENT_CENTER, Vi)
342             Call wGl_Draw_Text_Z(0, 12, PixelOffsetX - 10, PixelOffsetY + 39, 0#, ARGB(125, 18, 2, 255), FONT_ALIGNMENT_CENTER, Vi)

            End If

            'BlitFX (TM)
344         If .FXIndex <> 0 Then
346             Call DrawGrhtoSurface(.FX, PixelOffsetX + FxData(.FXIndex).OffsetX, PixelOffsetY + FxData(.FXIndex).OffsetY, wGl_Depth(3, x, y, 8), 1, 1, Color, , , True)

                'Check if animation is over
348             If .FX.Started = 0 Then .FXIndex = 0

            End If
                       
        End With

        '<EhFooter>
        Exit Sub

CharRender_Err:
        Call LogError(Err.Description & " in Cliente.Mod_TileEngine.CharRender at line " & Erl)
        Resume Next
        '</EhFooter>
End Sub

Sub RenderScreen(ByVal TileX As Integer, ByVal TileY As Integer, ByVal OffsetX As Integer, ByVal OffsetY As Integer)
    
    Dim x          As Long
    Dim y          As Long
    Dim Drawable   As Long
    Dim DrawableX  As Long
    Dim DrawableY  As Long
    
    Dim ScreenMinY As Long  'Start Y pos on current screen
    Dim ScreenMaxY As Long  'End Y pos on current screen
    
    Dim ScreenMinX As Long  'Start X pos on current screen
    Dim ScreenMaxX As Long  'End X pos on current screen
    
    Dim MinY       As Long  'Start Y pos on current map
    Dim MaxY       As Long  'End Y pos on current map
    
    Dim MinX       As Long  'Start X pos on current map
    Dim MaxX       As Long  'End X pos on current map

    'Figure out Ends and Starts of screen
    ScreenMinY = TileY - HalfWindowTileHeight
    ScreenMaxY = TileY + HalfWindowTileHeight
    ScreenMinX = TileX - HalfWindowTileWidth
    ScreenMaxX = TileX + HalfWindowTileWidth
    
    'Figure out Ends and Starts of map
    MinY = ScreenMinY
    MaxY = ScreenMaxY
    MinX = ScreenMinX
    MaxX = ScreenMaxX
    
    If OffsetY < 0 Then
        MaxY = MaxY + 1
    ElseIf OffsetY > 0 Then
        MinY = MinY - 1
    End If

    If OffsetX < 0 Then
        MaxX = MaxX + 1
    ElseIf OffsetX > 0 Then
        MinX = MinX - 1
    End If
    
    If MinY < YMinMapSize Then MinY = YMinMapSize
    If MaxY > YMaxMapSize Then MaxY = YMaxMapSize
    If MinX < XMinMapSize Then MinX = XMinMapSize
    If MaxX > XMaxMapSize Then MaxX = XMaxMapSize

    For y = MinY To MaxY
        DrawableY = (y - ScreenMinY) * TilePixelHeight + OffsetY
    
        For x = MinX To MaxX
            DrawableX = (x - ScreenMinX) * TilePixelWidth + OffsetX

            With MapData(x, y)
                Call DrawGrhtoSurface(.Graphic(1), DrawableX, DrawableY, wGl_Depth(1, x, y), 0, 1, .Color)
            End With
        Next x
    Next y
    
    Dim Results() As wGL_Swarm_Result
    Call g_Swarm.Query(MinX, MinY, MaxX, MaxY, Results)

    For Drawable = 0 To UBound(Results)

        With Results(Drawable)

            DrawableX = (.x - ScreenMinX) * TilePixelWidth + OffsetX
            DrawableY = (.y - ScreenMinY) * TilePixelHeight + OffsetY
            x = .x
            y = .y

            Select Case (.Layer)

                Case 1
                    With MapData(x, y)
                        Call DrawGrhtoSurface(.Graphic(2), DrawableX, DrawableY, wGl_Depth(2, x, y), 1, 1, .Color)
                    End With

                Case 2
                    With MapData(x, y)
                        If MapData(x, y).Graphic(3).Alpha Then
                            Call DrawGrhtoSurface(.Graphic(3), DrawableX, DrawableY, wGl_Depth(3, x, y, 2), 1, 1, &H99FFFFFF, , , True)
                        Else
                            Call DrawGrhtoSurface(.Graphic(3), DrawableX, DrawableY, wGl_Depth(3, x, y, 2), 1, 1, .Color, , , False)
                        End If
                    End With

                Case 3
                    If Not bTecho Then
                        Call DrawGrhtoSurface(MapData(x, y).Graphic(4), DrawableX, DrawableY, wGl_Depth(4, x, y, 2), 1, 1, &H60FFFFFF, 0, , True)
                    End If

                Case 4
                    With MapData(x, y)
                        If .ObjGrh.Alpha Then
                            Call DrawGrhtoSurface(.ObjGrh, DrawableX, DrawableY, wGl_Depth(3, x, y, 1), 1, 1, &H60FFFFFF, , , True)
                        Else
                            Call DrawGrhtoSurface(.ObjGrh, DrawableX, DrawableY, wGl_Depth(3, x, y, 1), 1, 1, .Color, , , False)
                        End If
                    End With

                Case 5
                    Call CharRender(MapData(x, y).CharIndex, DrawableX, DrawableY, White)
                    
            End Select
        End With
    Next Drawable
 
    If bRain Then

        If bLluvia(UserMap) = 1 Then
            'Figure out what frame to draw
            DrawRain
        End If

    End If

End Sub

Public Sub RenderSounds()
    Dim Trueno As Integer
    
    If Not Audio.SoundActivated Then Exit Sub
    
    Trueno = RandomNumber(1, 5000)
    
    
    '[CODE 001]:MatuX'
    If bLluvia(UserMap) = 1 Then
    
        If bRain Then
        
            If Trueno = 15 Then
                Call Audio.PlayWave("thunder.wav")
            End If
            
            If bTecho Then

                If IsPlaying <> PlayLoop.plLluviain Then

                    If SoundLluviaIndex > 0 Then Call Audio.StopWave(SoundLluviaIndex)
                    
                    SoundLluviaIndex = Audio.PlayWave("lluviain.wav", LoopStyle.Enabled)

                    IsPlaying = PlayLoop.plLluviain
                    

                End If

            Else

                If IsPlaying <> PlayLoop.plLluviaout Then
                
                    If SoundLluviaIndex > 0 Then Call Audio.StopWave(SoundLluviaIndex)
                    
                    SoundLluviaIndex = Audio.PlayWave("lluviaout.wav", LoopStyle.Enabled)
                    IsPlaying = PlayLoop.plLluviaout

                End If
               
            End If
            
        End If

    End If

End Sub

Sub LoadGraphics()

    RLluvia(0).Top = 0
    RLluvia(1).Top = 0
    RLluvia(2).Top = 0
    RLluvia(3).Top = 0
    RLluvia(0).Left = 0
    RLluvia(1).Left = 128
    RLluvia(2).Left = 256
    RLluvia(3).Left = 384
    RLluvia(0).Right = 128
    RLluvia(1).Right = 256
    RLluvia(2).Right = 384
    RLluvia(3).Right = 512
    RLluvia(0).Bottom = 128
    RLluvia(1).Bottom = 128
    RLluvia(2).Bottom = 128
    RLluvia(3).Bottom = 128

    RLluvia(4).Top = 128
    RLluvia(5).Top = 128
    RLluvia(6).Top = 128
    RLluvia(7).Top = 128
    RLluvia(4).Left = 0
    RLluvia(5).Left = 128
    RLluvia(6).Left = 256
    RLluvia(7).Left = 384
    RLluvia(4).Right = 128
    RLluvia(5).Right = 256
    RLluvia(6).Right = 384
    RLluvia(7).Right = 512
    RLluvia(4).Bottom = 256
    RLluvia(5).Bottom = 256
    RLluvia(6).Bottom = 256
    RLluvia(7).Bottom = 256
    
    AddtoRichTextBox frmCargando.status, "Hecho.", , , , 1, , False

End Sub

'[END]'
Function InitTileEngine(ByRef setDisplayFormhWnd As Long, _
                        ByVal setTilePixel As Integer, _
                        ByVal setWindowTileHeight As Integer, _
                        ByVal setWindowTileWidth As Integer, _
                        ByVal setTileBufferSize As Integer, _
                        ByVal setScrollPixel As Integer, _
                        ByVal setEngineSpeed As Single) As Boolean

    '*****************************************************************
    'InitEngine
    '*****************************************************************

    'Fill startup variables
    DisplayFormhWnd = setDisplayFormhWnd
    
    TilePixelWidth = setTilePixel
    TilePixelHeight = setTilePixel
    
    WindowTileHeight = setWindowTileHeight
    WindowTileWidth = setWindowTileWidth
    
    HalfWindowTileHeight = setWindowTileHeight * 0.5
    HalfWindowTileWidth = setWindowTileWidth * 0.5
    
    ScrollPixelsPerFrameX = setScrollPixel
    ScrollPixelsPerFrameY = setScrollPixel
    
    TileBufferSize = setTileBufferSize
    EngineBaseSpeed = setEngineSpeed

    MinXBorder = XMinMapSize + (WindowTileWidth \ 2)
    MaxXBorder = XMaxMapSize - (WindowTileWidth \ 2)
    MinYBorder = YMinMapSize + (WindowTileHeight \ 2)
    MaxYBorder = YMaxMapSize - (WindowTileHeight \ 2)
    
    'Set intial user position
    UserPos.x = MinXBorder
    UserPos.y = MinYBorder

    ReDim MapData(XMinMapSize To XMaxMapSize, YMinMapSize To YMaxMapSize) As MapBlock

    Call CargamosObjetos
    Call CargamosHechizos
    Call LoadGrhData
    Call CargarCabezas
    Call CargarCuerpos
    Call CargarCascos
    Call CargarBotas
    Call CargarFxs
    Call InicializarNombres

    LTLluvia(0) = 224
    LTLluvia(1) = 352
    LTLluvia(2) = 480
    LTLluvia(3) = 608
    LTLluvia(4) = 736
    LTLluvia(5) = 860
    LTLluvia(6) = 984

    PMascotas(1).Tipo = "Unicornio"
    PMascotas(2).Tipo = "Caballo Negro"
    PMascotas(3).Tipo = "Tigre"
    PMascotas(4).Tipo = "Elefante"
    PMascotas(5).Tipo = "Dragón"
    PMascotas(6).Tipo = "Jabato"
    PMascotas(7).Tipo = "Kong"
    PMascotas(8).Tipo = "Hipogrifo"
    PMascotas(9).Tipo = "Rinosaurio"
    PMascotas(10).Tipo = "Corcel"
    PMascotas(11).Tipo = "Wyvern"
    PMascotas(12).Tipo = "Avestruz"

    'unicornio
    PMascotas(1).VidaporLevel = 115
    PMascotas(1).GolpeporLevel = 25
    PMascotas(1).TopeAtMagico = 15
    PMascotas(1).TopeDefMagico = 9
    PMascotas(1).TopeEvasion = 6
    
    'negro
    PMascotas(2).VidaporLevel = 105
    PMascotas(2).GolpeporLevel = 27
    PMascotas(2).TopeAtMagico = 9
    PMascotas(2).TopeDefMagico = 15
    PMascotas(2).TopeEvasion = 6
    
    'tigre
    PMascotas(3).VidaporLevel = 185
    PMascotas(3).GolpeporLevel = 31
    PMascotas(3).TopeAtFlechas = 9
    PMascotas(3).TopeDefMagico = 9
    PMascotas(3).TopeEvasion = 12
    
    'elefante
    PMascotas(4).VidaporLevel = 225
    PMascotas(4).GolpeporLevel = 40
    PMascotas(4).TopeAtCuerpo = 15
    PMascotas(4).TopeDefCuerpo = 9
    PMascotas(4).TopeEvasion = 6
    
    'dragon
    PMascotas(5).VidaporLevel = 320
    PMascotas(5).GolpeporLevel = 42
    PMascotas(5).TopeAtMagico = 9
    PMascotas(5).TopeDefMagico = 9
    PMascotas(5).TopeEvasion = 9
    PMascotas(5).TopeAtCuerpo = 9
    PMascotas(5).TopeDefCuerpo = 9
    PMascotas(5).TopeAtFlechas = 9
    PMascotas(5).TopeDefFlechas = 9
    
    'jabalí pequeño
    PMascotas(6).VidaporLevel = 7
    PMascotas(6).GolpeporLevel = 6
    PMascotas(6).TopeDefMagico = 16
    PMascotas(6).TopeEvasion = 16
    PMascotas(6).TopeDefCuerpo = 16
    PMascotas(6).TopeDefFlechas = 16
    
    '- gigante
    PMascotas(7).VidaporLevel = 325
    PMascotas(7).GolpeporLevel = 45
    PMascotas(7).TopeDefCuerpo = 12
    PMascotas(7).TopeAtCuerpo = 9
    PMascotas(7).TopeDefFlechas = 9
    
    'Crom
    PMascotas(8).VidaporLevel = 325
    PMascotas(8).GolpeporLevel = 45
    PMascotas(8).TopeDefCuerpo = 12
    PMascotas(8).TopeDefMagico = 12
    PMascotas(8).TopeAtMagico = 6
    
    'rinosaurio
    PMascotas(9).VidaporLevel = 250
    PMascotas(9).GolpeporLevel = 37
    PMascotas(9).TopeEvasion = 9
    PMascotas(9).TopeDefMagico = 15
    PMascotas(9).TopeAtCuerpo = 6
    
    'corcel
    PMascotas(10).VidaporLevel = 160
    PMascotas(10).GolpeporLevel = 34
    PMascotas(10).TopeAtFlechas = 6
    PMascotas(10).TopeDefMagico = 12
    PMascotas(10).TopeDefCuerpo = 12
    
    'wyvern
    PMascotas(11).VidaporLevel = 100
    PMascotas(11).GolpeporLevel = 28
    PMascotas(11).TopeDefFlechas = 9
    PMascotas(11).TopeAtMagico = 12
    PMascotas(11).TopeDefMagico = 9
    
    'avestruz
    PMascotas(12).VidaporLevel = 150
    PMascotas(12).GolpeporLevel = 33
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
    PMascotas(7).TopeLevel = 30
    PMascotas(8).TopeLevel = 30
    PMascotas(9).TopeLevel = 30
    PMascotas(10).TopeLevel = 30
    PMascotas(11).TopeLevel = 30
    PMascotas(12).TopeLevel = 30
    '----------------------------------

    AddtoRichTextBox frmCargando.status, "Cargando Gráficos....", 255, 255, 255, 255, 255, True
    Call LoadGraphics

    InitTileEngine = True

End Function

Function ShowNextFrame() As Boolean

    '***********************************************
    'Updates and draws next frame to screen
    '***********************************************
    Static OffsetCounterX As Single
    Static OffsetCounterY As Single

    Static FrameTime      As Currency
    Static FrameNextTime  As Currency
    
    FrameTime = FrameTime + GetFrameElapsedTime()
            
    If (Not g_Mode = MODE_SYNCHRONISED Or FrameTime >= FrameNextTime) Then
        
        '****** Move screen Left, Right, Up and Down if needed ******
        If UserMoving Then
    
            If AddtoUserPos.x <> 0 Then
                OffsetCounterX = OffsetCounterX - ScrollPixelsPerFrameX * AddtoUserPos.x * TimerTicksPerFrame
    
                If Abs(OffsetCounterX) >= Abs(TilePixelWidth * AddtoUserPos.x) Then
                    OffsetCounterX = 0
                    AddtoUserPos.x = 0
                    UserMoving = False
                End If

            End If

            If AddtoUserPos.y <> 0 Then
                OffsetCounterY = OffsetCounterY - ScrollPixelsPerFrameY * AddtoUserPos.y * TimerTicksPerFrame

                If Abs(OffsetCounterY) >= Abs(TilePixelHeight * AddtoUserPos.y) Then
                    OffsetCounterY = 0
                    AddtoUserPos.y = 0
                    UserMoving = False
                End If

            End If

        End If

        '****** Update screen ******
    
        Call wGL_Graphic.Use_Device(&H0)
        Call wGL_Graphic.Clear(CLEAR_COLOR Or CLEAR_DEPTH Or CLEAR_STENCIL, &H0, 1#, 0)
        Call wGL_Graphic_Renderer.Update_Projection(&H0, frmMain.MainViewPic.ScaleWidth, frmMain.MainViewPic.ScaleHeight)

        Call SetEffect(UserEstado = 1)

        '****** Update screen ******
        If Not UserCiego Then
            Call RenderScreen(UserPos.x - AddtoUserPos.x, UserPos.y - AddtoUserPos.y, OffsetCounterX, OffsetCounterY)

        End If
    
        frmMain.Label3.Caption = CurMap
        frmMain.Label10.Caption = "X:" & UserPos.x
        frmMain.Label11.Caption = "Y:" & UserPos.y

        Dim Nus As Integer

        If UserGuerra Then
            Call wGl_Draw_Text_Z(0, 15, 260, 260, 0#, vbYellow, FONT_ALIGNMENT_CENTER, "¡Estas En Guerra!") 'Guerras
        End If

        'pluto:6.0A
        If ECiudad Then
            Call wGl_Draw_Text_Z(0, 15, 260, 260, 0#, vbYellow, FONT_ALIGNMENT_CENTER, EstadoCiudad)
        End If

        If PYFLAG Then
            Call wGl_Draw_Text_Z(0, 15, 260, 760 - (10 * (Party.numMiembros + 1)), 0#, ARGB(255, 255, 255, 255), FONT_ALIGNMENT_CENTER, "Miembros: " & Party.numMiembros)
            Dim i    As Long
            Dim tStr As String
            Dim cco  As Long

            For i = 1 To Party.numMiembros

                'pluto:6.0A
                With Party.Miembros(i)
                    If CharList(.Index).Muerto = False Then cco = COLORS.White Else cco = COLORS.Red

                    tStr = .Nombre & " (" & .privi & "%)"
                    If .x = 0 Or .y = 0 Then tStr = tStr & " X: " & .x & " Y: " & .y
                    
                    Call wGl_Draw_Text_Z(0, 15, 260, 760 - (10 * i), 0#, cco, FONT_ALIGNMENT_CENTER, tStr)
                End With
            Next

        End If

        'pluto:2.9.0
        Select Case CurMap
        
            Case 192
                Call wGl_Draw_Text_Z(0, 15, 445, 260, 0#, COLORS.White, FONT_ALIGNMENT_CENTER, "Local..........: " & Goleslocal)
                Call wGl_Draw_Text_Z(0, 15, 445, 275, 0#, COLORS.White, FONT_ALIGNMENT_CENTER, "Visitante...: " & Golesvisitante)
      
            Case 194
                Call wGl_Draw_Text_Z(0, 15, 445, 260, 0#, COLORS.White, FONT_ALIGNMENT_CENTER, "El Mejor Luchador es " & UserTorneo2 & " con " & RecordTorneo2 & " Victorias")
                Call wGl_Draw_Text_Z(0, 15, 495, 275, 0#, COLORS.White, FONT_ALIGNMENT_CENTER, "Bote Acumulado: " & BoteTorneo2)
                Call wGl_Draw_Text_Z(0, 15, 445, 290, 0#, COLORS.White, FONT_ALIGNMENT_CENTER, "El Bote es para quien consiga 10 victorias consecutivas.")
        
        End Select

        Call Dialogos.Render
        Call DibujarCartel
    
        If GetTickCount() - AmbientLastCheck >= 1000 Then
            Call Ambient_Check
            AmbientLastCheck = GetTickCount()

        End If
                
        If Ambiente.Fade Then
            Call Ambient_Fade
        End If

        Call wGL_Graphic_Renderer.Flush
        
        FrameNextTime = FrameTime + (1000 / 144) ' 144 = Target FPS
        ShowNextFrame = True
    
        'Inventario
        Call Inventario.DrawInv
    
        'Get timing info
        TimerElapsedTime = GetElapsedTime()
        TimerTicksPerFrame = TimerElapsedTime * EngineBaseSpeed
        timerEngine = timerEngine + TimerElapsedTime
    End If
    
End Function

Private Function GetOffSetMontura(ByVal HeadOffSetY As Integer) As Integer

    Dim NewOffSet As Integer

    NewOffSet = 0

    Select Case HeadOffSetY

        Case -71
            NewOffSet = 68
            
        Case -69
            NewOffSet = 68

        Case -59
            NewOffSet = 58
            
        Case -61
            NewOffSet = 58

        Case -38
            NewOffSet = 34

        Case -39
            NewOffSet = 34

        Case -40
            NewOffSet = 36

        Case -42
            NewOffSet = 35

        Case -45
            NewOffSet = 39

        Case -30
            NewOffSet = 30

        Case -24
            NewOffSet = 20

        Case -9
            NewOffSet = 8

    End Select

    GetOffSetMontura = NewOffSet

End Function

Public Sub SetCharacterTag(ByVal CharIndex As Integer)

    Dim SeeChar As Boolean

    With CharList(CharIndex)
 
        SeeChar = Not .invisible

        If UserCharIndex > 0 Then
            SeeChar = SeeChar Or CharIndex = UserCharIndex

            If CharList(UserCharIndex).GM = 0 Then
                SeeChar = SeeChar Or (LenB(.Clan) > 0 And .Clan = CharList(UserCharIndex).Clan)
                SeeChar = SeeChar Or (.NumParty > 0 And .NumParty = CharList(UserCharIndex).NumParty)
                SeeChar = SeeChar Or (.rReal > 0 And .rReal = CharList(UserCharIndex).rReal And (CurMap < 166 Or CurMap > 169 And CurMap <> 185))
            Else
                SeeChar = True

            End If

        End If

        '(.rReal = 1 and .rReal = CharList(UserCharIndex).rReal And (CurMap < 166 Or CurMap > 169 And CurMap <> 185))
   
        'sin clan: color horda
        If ((.Criminal = 1) And (.GM = 0) And (.invisible = 0)) Then
                                
            If .LiderHorda Then
                .NombreColor = Salmon
            ElseIf .Credito = 2 Then
                .NombreColor = DarkGreen
            ElseIf .rReal = 2 Then
                .NombreColor = DarkRed
            Else
                .NombreColor = DarkSalmon 'ARGB(127, 0, 0, 255)

            End If

            If LenB(.Clan) <> 0 Then
                .ClanColor = Orange

            End If

        ElseIf ((.GM = 0) And (.legion = 0) And (.invisible = 0)) Then
                                
            If .LiderAlianza Then
                .NombreColor = BlueViolet
            ElseIf .Credito = 1 Then
                .NombreColor = Green
            ElseIf .rReal = 1 Then
                .NombreColor = Cyan
            Else
                .NombreColor = Gray

            End If

            If LenB(.Clan) <> 0 Then
                .ClanColor = Orange

            End If

        ElseIf ((.GM = 0) And (.legion = 1) And (.invisible = 0)) Then
                        
            .NombreColor = Green

            If LenB(.Clan) <> 0 Then
                .ClanColor = Orange

            End If

        ElseIf .GM > 0 Then
            
            .NombreColor = White

            If LenB(.Clan) <> 0 Then
                .ClanColor = White

            End If

        ElseIf SeeChar Then

            If .invisible Then
                .NombreColor = Pink

                If LenB(.Clan) <> 0 Then
                    .ClanColor = Yellow

                End If

            End If

        End If

    End With

End Sub

Public Sub SetCharacterFx(ByVal CharIndex As Integer, ByVal FX As Long, ByVal Loops As Integer)

    '***************************************************
    'Sets an FX to the character.
    '***************************************************
    With CharList(CharIndex)
        .FXIndex = FX
        
        If .FXIndex > 0 Then
            Call InitGrh(.FX, FxData(FX).FX)
        
            If Loops = INFINITE_LOOPS Then
                .FX.Loops = Loops
            Else
                .FX.Loops = 0
            End If

        End If

    End With

End Sub

Private Function GetFrameElapsedTime() As Single

    '**************************************************************
    'Author: Aaron Perkins
    'Last Modify Date: 10/07/2002
    'Gets the time that past since the last call
    '**************************************************************

    Dim start_time    As Currency
    Static end_time   As Currency
    Static timer_freq As Currency

    'Get the timer frequency
    If timer_freq = 0 Then
        Call QueryPerformanceFrequency(timer_freq)
    End If
    If end_time = 0 Then
        Call QueryPerformanceCounter(end_time)
    End If
    
    'Get current time
    Call QueryPerformanceCounter(start_time)
    
    'Calculate elapsed time
    GetFrameElapsedTime = (start_time - end_time) / timer_freq * 1000
    
    'Get next end time
    Call QueryPerformanceCounter(end_time)
  
    Exit Function
  
End Function

Public Function GetElapsedTime() As Single
    
    '**************************************************************
    'Author: Aaron Perkins
    'Last Modify Date: 10/07/2002
    'Gets the time that past since the last call
    '**************************************************************
    Dim start_time    As Currency
    Static end_time   As Currency
    Static timer_freq As Currency

    'Get the timer frequency
    If timer_freq = 0 Then
        Call QueryPerformanceFrequency(timer_freq)

    End If

    If end_time = 0 Then
        Call QueryPerformanceCounter(end_time)

    End If
    
    'Get current time
    Call QueryPerformanceCounter(start_time)
    
    'Calculate elapsed time
    GetElapsedTime = (start_time - end_time) / timer_freq * 1000
    
    'Get next end time
    Call QueryPerformanceCounter(end_time)
    
End Function

Public Sub SetEffect(ByVal Grayscale As Boolean)
    If (Grayscale) Then
        g_Uniform.Effect.x = 1
    Else
        g_Uniform.Effect.x = 0
    End If
    
    Call wGL_Graphic.Use_Uniform(&H4, False, g_Uniform, 1)
End Sub
