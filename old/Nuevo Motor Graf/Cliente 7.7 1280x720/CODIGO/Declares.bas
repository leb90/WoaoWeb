Attribute VB_Name = "Mod_Declaraciones"
Option Explicit

'nati:7.0
Public PuedoUsarMagia As Integer
Public Chats          As Integer
Public DBe            As Integer
Public TimePara       As Integer
Public TimeInvi       As Integer
Public PingTime       As Long

'Delzak)
Public CustomKeys     As New clsCustomKeys
Public Audio          As New ClsAudio
Public Dialogos       As New clsDialogs
Public Inventario     As New clsGrapchicalInventory

'pluto:7.0-----------------------------------
Public MemoAgi        As Integer
Public MemoFue        As Integer

Type Viaje

    ciudad As String
    Valor As Integer

End Type

'-----------------------------------------

'Sistema MP3 -/ Gimli - Toto
Public Mp3Music As Boolean
Public Const Mp3_Inicio As Byte = 3
Public currentMp3 As Long

'mp3


Public MacPluto   As String
Public MacClave   As Integer
Public HayMiniMap As Boolean    'minimap

Public Declare Function CreateEllipticRgn Lib "gdi32" (ByVal X1 As Long, ByVal Y1 As Long, ByVal X2 As Long, ByVal Y2 As Long) As Long

Public Declare Function CreateRoundRectRgn Lib "gdi32" (ByVal X1 As Long, _
                                                        ByVal Y1 As Long, _
                                                        ByVal X2 As Long, _
                                                        ByVal Y2 As Long, _
                                                        ByVal X3 As Long, _
                                                        ByVal Y3 As Long) As Long    'minimap
Public Declare Function SetWindowRgn Lib "User32" (ByVal hWnd As Long, ByVal hRgn As Long, ByVal bRedraw As Boolean) As Long    'minimap
Public Declare Function GetWindowLong Lib "User32" Alias "GetWindowLongA" (ByVal hWnd As Long, ByVal nIndex As Long) As Long    'minimap

Public Declare Function SetWindowLong Lib "User32" Alias "SetWindowLongA" (ByVal hWnd As Long, _
                                                                           ByVal nIndex As Long, _
                                                                           ByVal dwNewLong As Long) As Long    'minimap
Public Declare Function SetLayeredWindowAttributes Lib "User32" (ByVal hWnd As Long, _
                                                                 ByVal crKey As Long, _
                                                                 ByVal bAlpha As Byte, _
                                                                 ByVal dwFlags As Long) As Long    'minimap
Public Declare Sub ReleaseCapture Lib "User32" ()    'minimap
Public Declare Function SendMessage Lib "User32" Alias "SendMessageA" (ByVal hWnd As Long, _
                                                                       ByVal wMsg As Long, _
                                                                       ByVal wParam As Integer, _
                                                                       ByVal lParam As Long) As Long    'minimap

'nati: Abrir Explorador Predeterminado!
Public Declare Function ShellExecute Lib "shell32.dll" Alias "ShellExecuteA" (ByVal hWnd As Long, _
                                                                              ByVal lpOperation As String, _
                                                                              ByVal lpFile As String, _
                                                                              ByVal lpParameters As String, _
                                                                              ByVal lpDirectory As String, _
                                                                              ByVal nShowCmd As Long) As Long
                                                                              
                                                                        

                                                                        
Public Const conSwNormal = 1

Public TipoLetra           As Byte

Public IChe                As Boolean
'Delzak)
Public Wpe                 As Boolean
Public Bengi               As Boolean
Public WpeLen              As Long
'Texto
Public TopVentana          As Boolean
'pluto:6.4
Public EstadoF             As String
Public HaciendoFoto        As Boolean
'pluto:6.8
'Public LoGTeclas           As Boolean
'Public LoGTeclas2          As String
'Public TIPOCHEAT           As Byte
'Public Rama(15)            As String

Public Noengi              As Boolean
Public TrozoFichi(1 To 19) As String
Public Trozo               As Byte
Public IndiceLabel         As Integer


Public Const SND_CLICK = "click.Wav"
Public Const SND_PASOS1 = "23.Wav"
Public Const SND_PASOS2 = "24.Wav"
Public Const SND_NAVEGANDO = "50.wav"
Public Const SND_OVER = "click2.Wav"
Public Const SND_DICE = "cupdice.Wav"
Public Const MIdi_Inicio = 6

'pluto:6.0A
Public SeguroCrimi        As Boolean

'---------------------------
'pluto:2.17
'Public SmSlabel As String
Public PMascotas(1 To 12) As PMascotas

Type PMascotas

    Tipo As String
    AumentoCuerpo As Byte
    AumentoMagia As Byte
    ReduceCuerpo As Byte
    ReduceMagia As Byte
    AumentoFlecha As Byte
    ReduceFlecha As Byte
    AumentoEvasion As Byte
    TopeLevel As Byte
    VidaporLevel As Integer
    GolpeporLevel As Integer
    exp(1 To 12) As Long
    TopeAtMagico As Byte
    TopeDefMagico As Byte
    TopeAtFlechas As Byte
    TopeDefFlechas As Byte
    TopeAtCuerpo As Byte
    TopeDefCuerpo As Byte
    TopeEvasion As Byte

End Type

'pluto 2.25
Public Navida         As Byte
Public Resolu         As Byte
Public Son            As Byte
Public Musi           As Byte
Public NivelVolMusica As Integer

Public Bmplluvia      As Integer
Public SinTecho       As Byte
Public LogInicial     As String

Public Generagenero   As Byte
Public SELECI         As Byte
Public NameCorrecto   As Boolean

Public hechi          As Byte
Public RawServersList As String
'pluto:2.14
Public totalda        As Integer
Public Busca8         As Integer
Public Dir7           As String
Public Mapa8          As String
Public TimeDado       As Boolean

Public Type tServerInfo

    Ip As String
    Puerto As Integer
    Desc As String
    PassRecPort As Integer

End Type

'pluto:2.4.7
'Public Declare Sub keybd_event Lib "user32" (ByVal bVk As Byte, ByVal bScan As Byte, ByVal dwFlags As Long, ByVal dwExtraInfo As Long)
Public fotoinvi      As String

'pluto:2.11
Public intentos      As Byte

'pluto:2.25---------
Public Segu          As Boolean
Public ChatElegido   As Byte
'-------------------
'pluto:2.5.0
Public KeyCodi       As String
Public Keycodi2      As String
Public vez           As Byte
'pluto:2.8.0
Public PideCuenta    As Boolean
Public PideClave     As Boolean
'pluto:2.15
Public web           As String
Public Orden         As Byte

Public CreandoClan   As Boolean
Public ClanName      As String
Public Site          As String

Public UserCiego     As Boolean
Public UserEstupido  As Boolean
'pluto:2.12
Public BoteTorneo2   As Long
Public UserTorneo2   As String
Public RecordTorneo2 As Integer

Public VolumeX As Integer

'pluto:2.4.2
Public Const tAt = 2000
Public Const tUs = 400

'pluto:6.0A
Public Const tMg = 376
'Public tMg As Integer

'pluto:2.8.0
Public Const tFle = 1400

'pluto:2.4.5
Public Const tTr = 4000

Public Const bCabeza = 1
Public Const bPiernaIzquierda = 2
Public Const bPiernaDerecha = 3
Public Const bBrazoDerecho = 4
Public Const bBrazoIzquierdo = 5
Public Const bTorso = 6

Public Const PrimerBodyBarco = 84
Public Const UltimoBodyBarco = 87

Public NumEscudosAnims            As Integer

Public ArmasHerrero(0 To 100)     As Integer
Public ArmadurasHerrero(0 To 100) As Integer
Public ObjCarpintero(0 To 100)    As Integer
'[MerLiNz:6]
Public ObjErmitaño(0 To 100) As Integer
'[\END]

Public Const MAX_BANCOINVENTORY_SLOTS = 20

Public UserBancoInventory(1 To MAX_BANCOINVENTORY_SLOTS) As Inventory
'pluto:6.0A
Public Const MAX_BOVEDACLAN_SLOTS = 40
Public UserClanInventory(1 To MAX_BOVEDACLAN_SLOTS) As Inventory

Public Const LoopAdEternum = 999

Public Const NUMCIUDADES = 3

'Direcciones
Public Enum E_Heading
    NORTH = 1
    EAST = 2
    SOUTH = 3
    WEST = 4

End Enum



'Objetos
Public Const MAX_INVENTORY_OBJS = 10000
Public Const MAX_INVENTORY_SLOTS = 36
Public Const MAX_NPC_INVENTORY_SLOTS = 50
Public Const MAXHECHI = 50

Public Const NUMSKILLS = 31
Public Const NUMATRIBUTOS = 5
Public Const NUMCLASES = 19
Public Const NUMRAZAS = 12

Public Const MAXSKILLPOINTS = 200

Public Const FLAGORO = 777

Public Const FOgata = 1521

Public Enum eGenero

    Hombre = 1
    Mujer

End Enum

Public Const f1 = 70
Public Const f2 = 20
Public Const f3 = 20
Public ServActual As Byte
Public Pvez       As Byte
'[Tite]Party
Public Const MAXMIEMBROS = 10

'[\Party]
'%%%%%%%%%% CONSTANTES DE INDICES %%%%%%%%%%%%%%%
Public Const Suerte = 1
Public Const Magia = 2
Public Const Robar = 3
Public Const Tacticas = 4
Public Const Armas = 5
Public Const Meditar = 6
Public Const Apuñalar = 7
Public Const Ocultarse = 8
Public Const Supervivencia = 9
Public Const Talar = 10
Public Const Comerciar = 11
Public Const Defensa = 12    'escudos
Public Const Pesca = 13
Public Const Mineria = 14
Public Const Carpinteria = 15
Public Const Herreria = 16
Public Const Liderazgo = 17
Public Const Domar = 18
Public Const Proyectiles = 19    'Acertar Proyec.
Public Const Navegacion = 21

'pluto:2.15
Public Const DobleArma = 20    'Posibilidad de golpear con la segunda

Public Const DañoMagia = 22
Public Const DefMagia = 23
Public Const EvitaMagia = 24
'Requerido es Magia (2)

Public Const DañoArma = 25   'vale para dos manos también
Public Const DefArma = 26    'vale para dos manos también
Public Const RequeArma = 27    ' vale para dos manos.
'acertar es Armas (5)
'evitar es tactica (4)

Public Const DañoProyec = 28
Public Const DefProyec = 29
Public Const RequeProyec = 30
Public Const EvitarProyec = 31
'acertar es Proyectiles (19)

Public Const FundirMetal = 88
'pluto:2.15
Public DueñoNix As Byte
Public DueñoCaos As Byte
Public DueñoUlla As Byte
Public DueñoBander As Byte
Public DueñoLindos As Byte
Public DueñoQuest As Byte
Public DueñoArghal As Byte
Public DueñoDescanso As Byte
Public DueñoLaurana As Byte
Public DueñoEsperanza As Byte
Public DueñoAtlantis As Byte
Public DueñoDesierto As Byte

'Inventario
Type Inventory

    ObjIndex As Integer
    Name As String
    GrhIndex As Long
    Amount As Long
    Equipped As Byte
    Valor As Long
    ObjType As Integer
    DefMax As Integer
    DefMin As Integer
    MaxHit As Integer
    MinHit As Integer
    'pluto:2.3
    SubTipo As Integer
    peso As Double

End Type

Type NpCinV

    ObjIndex As Integer
    Name As String
    GrhIndex As Long
    Amount As Integer
    Valor As Long
    ObjType As Integer
    DefMax As Integer
    DefMin As Integer
    MaxHit As Integer
    MinHit As Integer
    c1 As String
    C2 As String
    C3 As String
    C4 As String
    C5 As String
    C6 As String
    C7 As String

End Type

Type tReputacion    'Fama del usuario

    NobleRep As Long
    BurguesRep As Long
    PlebeRep As Long
    LadronesRep As Long
    BandidoRep As Long
    AsesinoRep As Long
    Promedio As Long

End Type

'[Tite]Party
Type cMiembros

    Nombre As String
    privi As Byte
    Index As Integer
    x As Byte
    y As Byte

End Type

Type cparty

    Miembros(1 To MAXMIEMBROS) As cMiembros
    numMiembros As Byte
    Solicitudes(1 To MAXMIEMBROS) As String
    numSolicitudes As Byte
    reparto As Byte

End Type

'[\Tite]

Public ListaRazas()                             As String
Public ListaClases()                            As String

Public Nombres                                  As Boolean
Public clas                                     As String
Public MixedKey                                 As Long

'User status vars
Global OtroInventario(1 To MAX_INVENTORY_SLOTS) As Inventory
Public UserHechizos(1 To MAXHECHI)              As Integer
'[Tite]Party
Public Party                                    As cparty
'[\Tite]

Type Premios    'Delzak sistema premios

    MataNPCs(1 To 34) As Integer

End Type

'Constantes de sistema premios

Enum NPCsPremios

    Animales = 0
    Arañas
    Goblin
    Orcos
    Largartos
    Genios
    Hobbits
    Ogros
    Hechiceros
    Nomuertos
    Darks
    Trolls
    Beholders
    Golems
    Marinos
    Ents
    Licantropos
    Medusas
    Ciclopes
    Polares
    Devastador
    Gigantes
    Piratas
    Uruks
    Demonios
    Devir
    Gollums
    Dragones
    Ettin
    Puertas
    Reyes
    Defensores
    Raids
    Navidades

End Enum

Public NPCInventory(1 To MAX_NPC_INVENTORY_SLOTS) As NpCinV
Public NPCViajes(1 To MAX_NPC_INVENTORY_SLOTS)    As Viaje
Public NPCInvDim                                  As Integer
Public Premios                                    As Premios            'Delzak sistema premios
Public UserMeditar                                As Boolean
Public UserName                                   As String
Public Usercuenta                                 As String
Public MostrarIndexNombre                         As String
Public UserPassword                               As String
Public UserMaxHP                                  As Integer
Public UserMinHP                                  As Integer
Public UserMaxMAN                                 As Integer
Public UserMinMAN                                 As Integer
Public UserMaxSTA                                 As Integer
Public UserMinSTA                                 As Integer
Public UserGLD                                    As Long
Public UserLvl                                    As Integer
Public UserPort                                   As Integer
Public UserServerIP                               As String
Public UserCanAttack                              As Integer
Public UserEstado                                 As Byte         '0 = Vivo & 1 = Muerto
Public UserPasarNivel                             As Double
Public UserExp                                    As Double
'pluto:2.3
Public UserPeso                                   As Single
Public UserPesoMax                                As Integer
'pluto:2.15
Public Ergs                                       As String

Public UserReputacion                             As tReputacion
Public UserDescansar                              As Boolean
Public FPSFLAG                                    As Boolean
Public PYFLAG                                     As Boolean
Public ECiudad                                    As Boolean
Public EstadoCiudad                               As String
Public pausa                                      As Boolean
Public EnDuelo                                    As Boolean
'Public IScombate As Boolean
Public UserParalizado                             As Boolean
Public isOpen                                     As Boolean
Public UserInvisible                              As Boolean
Public UserNavegando                              As Boolean
Public UserHogar                                  As String

'<-------------------------NUEVO-------------------------->
Public Comerciando                                As Boolean
'<-------------------------NUEVO-------------------------->
Public Miraza                                     As String
Public Miclase                                    As String

Public UserClase                                  As String
Public UserSexo                                   As String
Public UserSexoN                                  As Integer
Public UserRaza                                   As String
Public UserRazaN                                   As Integer
Public UserEmail                                  As String

Public Type BodyAndHeadInfo

    HeadFirst As Integer
    HeadLast As Integer
    Body As Integer
         
End Type

Public BodysAndHeads(1 To 2, 1 To NUMRAZAS) As BodyAndHeadInfo


Public UserSkills()                               As Integer
Public SkillsNames()                              As String

Public UserAtributos()                            As Integer
'pluto:7.0
Public UserPorcentajes(1 To 6)                    As Byte

Public AtributosNames()                           As String

Public Ciudades()                                 As String
Public CityDesc()                                 As String

Public Fasis                                      As Byte
Public LugarServer                                As Byte

Public FontPrimary                                As String
Public FontSecondary                              As String

Public SkillPoints                                As Integer
Public Alocados                                   As Integer
Public Flags()                                    As Integer
Public Oscuridad                                  As Integer
Public logged                                     As Boolean
Public NoPuedeUsar                                As Boolean
Public NoPuedeMagia                               As Boolean
'pluto:2.8.0
Public NoPuedeFlechas                             As Boolean

'pluto:2.4.5
Public NoPuedeTirar                               As Boolean

Public UsingSkill                                 As Integer
Public Macreando                                  As Byte

'Server stuff
Public RequestPosTimer                            As Integer            'Used in main loop
Public stxtbuffer                                 As String           'Holds temp raw data from server
Public SendNewChar                                As Boolean            'Used during login
Public Connected                                  As Boolean            'True when connected to server
Public DownloadingMap                             As Boolean            'Currently downloading a map from server
Public UserMap                                    As Integer

'String contants
Public ENDC                                       As String           'Endline character for talking with server
Public ENDL                                       As String           'Holds the Endline character for textboxes

'Control
Public prgRun                                     As Boolean            'When true the program ends
Public finpres                                    As Boolean

Public IPdelServidor                              As String
'Public PuertoDelServidor As String

'********** FUNCIONES API ***********
Public Declare Function GetTickCount Lib "kernel32" () As Long

'para escribir y leer variables
Public Declare Function writeprivateprofilestring Lib "kernel32" Alias "WritePrivateProfileStringA" (ByVal lpApplicationname As String, _
                                                                                                     ByVal lpKeyname As Any, _
                                                                                                     ByVal lpString As String, _
                                                                                                     ByVal lpFileName As String) As Long
Public Declare Function getprivateprofilestring Lib "kernel32" Alias "GetPrivateProfileStringA" (ByVal lpApplicationname As String, _
                                                                                                 ByVal lpKeyname As Any, _
                                                                                                 ByVal lpdefault As String, _
                                                                                                 ByVal lpreturnedstring As String, _
                                                                                                 ByVal nsize As Long, _
                                                                                                 ByVal lpFileName As String) As Long

'Teclado
Public Declare Function GetAsyncKeyState Lib "User32" (ByVal nVirtKey As Long) As Integer

Public Declare Sub Sleep Lib "kernel32" (ByVal dwMilliseconds As Long)
'pluto:2.14
Public Declare Function GetVolumeInformation& Lib "kernel32" Alias "GetVolumeInformationA" (ByVal lpRootPathName As String, _
                                                                                            ByVal pVolumeNameBuffer As String, _
                                                                                            ByVal nVolumeNameSize As Long, _
                                                                                            lpVolumeSerialNumber As Long, _
                                                                                            lpMaximumComponentLength As Long, _
                                                                                            lpFileSystemFlags As Long, _
                                                                                            ByVal lpFileSystemNameBuffer As String, _
                                                                                            ByVal nFileSystemNameSize As Long)

'Lista de cabezas
Public Type tIndiceCabeza

    Head(1 To 4) As Integer

End Type

Public Type tIndiceCuerpo

    'Pluto:2.11
    Body(1 To 8) As Integer
    HeadOffsetX As Integer
    HeadOffSetY As Integer

End Type

'[GAU]
Public Type tIndiceBota

    Botas(1 To 4) As Integer
    HeadOffsetX As Integer
    HeadOffSetY As Integer

End Type

'[GAU]
Public Type tIndiceFx

    Animacion As Integer
    OffsetX As Integer
    OffsetY As Integer

End Type

'pluto:2-3-04
Public SeguroRev      As Boolean
Public SeguroObjetos  As Boolean

'pluto:2.9.0
Public Goleslocal     As Byte
Public Golesvisitante As Byte

'pluto:2.15
Public CiudaMuertos   As Integer
Public CrimiMuertos   As Integer
Public NeutrMuertos   As Integer

'lele: fix transparencias malas de nati
Public Const LWA_COLORKEY = 1
Public Const LWA_ALPHA = 2
Public Const LWA_BOTH = 3
Public Const WS_EX_LAYERED = &H80000
'Public Const GWL_EXSTYLE = -20


 


'nati:transparencias
Public Const GWL_EXSTYLE = (-20)
Public Const WS_EX_TRANSPARENT = &H20&
'nati:transparencias

'nati: descargar imagen
Private Type TGUID

    Data1 As Long
    Data2 As Integer
    Data3 As Integer
    Data4(0 To 7) As Byte

End Type

Private Declare Function OlecLoadPicturePath Lib "oleaut32.dll" (ByVal szURLorPath As Long, _
                                                                ByVal punkCaller As Long, _
                                                                ByVal dwReserved As Long, _
                                                                ByVal clrReserved As OLE_COLOR, _
                                                                ByRef riid As TGUID, _
                                                                ByRef ppvRet As IPicture) As Long
                                                                
                                                                
                                                                
                                                                
                                                                
                                                                
                                                                
                                                                
                                                                
                                                                
                                                                
                                                                
                                                                
                                                                
                                                                
                                                                
                                                                
' super lele


Global gHookHWND As Long
 
Public Type RECT
        Left As Long
        Top As Long
        Right As Long
        Bottom As Long
End Type

Public Type PAINTSTRUCT
    hdc                     As Long
    fErase                  As Long
    rcPaint                 As RECT
    fRestore                As Long
    fIncUpdate              As Long
    rgbReserved(1 To 32)    As Byte
End Type

'Public Const GWL_WNDPROC = (-4)
Public Const WM_PAINT = &HF

Public Declare Function BeginPaint Lib "User32" (ByVal hWnd As Long, lpPaint As PAINTSTRUCT) As Long
Public Declare Function BitBlt Lib "gdi32" (ByVal hDestDC As Long, ByVal x As Long, ByVal y As Long, ByVal nWidth As Long, ByVal nHeight As Long, ByVal hSrcDC As Long, ByVal xSrc As Long, ByVal ySrc As Long, ByVal dwRop As Long) As Long

Public Declare Function CallWindowProc Lib "User32" Alias "CallWindowProcA" (ByVal lpPrevWndFunc As Long, ByVal hWnd As Long, ByVal msg As Long, ByVal wParam As Long, ByVal lParam As Long) As Long
Public Declare Function CreateCompatibleBitmap Lib "gdi32" (ByVal hdc As Long, ByVal nWidth As Long, ByVal nHeight As Long) As Long
Public Declare Function CreateCompatibleDC Lib "gdi32" (ByVal hdc As Long) As Long
Public Declare Function DeleteDC Lib "gdi32" (ByVal hdc As Long) As Long
Public Declare Function DeleteObject Lib "gdi32" (ByVal hObject As Long) As Long
Public Declare Function EndPaint Lib "User32" (ByVal hWnd As Long, lpPaint As PAINTSTRUCT) As Long
Public Declare Function GetClientRect Lib "User32" (ByVal hWnd As Long, lpRect As RECT) As Long
Public Declare Function GetProp Lib "User32" Alias "GetPropA" (ByVal hWnd As Long, ByVal lpString As String) As Long
Public Declare Function RemoveProp Lib "User32" Alias "RemovePropA" (ByVal hWnd As Long, ByVal lpString As String) As Long
Public Declare Function SelectObject Lib "gdi32" (ByVal hdc As Long, ByVal hObject As Long) As Long
Public Declare Function SetProp Lib "User32" Alias "SetPropA" (ByVal hWnd As Long, ByVal lpString As String, ByVal hData As Long) As Long

Public Declare Sub CopyMemory Lib "kernel32.dll" Alias "RtlMoveMemory" (destination As Any, source As Any, ByVal length As Long)

Public pRect As RECT

