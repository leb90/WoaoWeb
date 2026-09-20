Attribute VB_Name = "TCP"
Option Explicit

'Buffer en bytes de cada socket
Public Const SOCKET_BUFFER_SIZE = 2048

'Cuantos comandos de cada cliente guarda el server
Public Const COMMAND_BUFFER_SIZE = 1000

Public Const NingunArma = 2

'RUTAS DE ENVIO DE DATOS

'PLUTO:2.15---------------
Public BytesRecibidos As Long
Public BytesEnviados As Long
Public TotalBytesRecibidos As Long
Public TotalBytesEnviados As Long
'Public BytesRecibidos As Long
'Public BytesEnviados As Long
'-----------------------------------
Public Const ToIndex = 0    'Envia a un solo User
Public Const ToAll = 1    'A todos los Users
Public Const ToMap = 2    'Todos los Usuarios en el mapa
Public Const ToPCArea = 3    'Todos los Users en el area de un user determinado
Public Const ToNone = 4    'Ninguno
Public Const ToAllButIndex = 5    'Todos menos el index
Public Const ToMapButIndex = 6    'Todos en el mapa menos el indice
Public Const ToGM = 7
Public Const ToNPCArea = 8    'Todos los Users en el area de un user determinado
Public Const ToGuildMembers = 9
Public Const ToAdmins = 10
'pluto:2.9.0
Public Const ToTorneo = 11
'pluto:2.14
Public Const ToClan = 12
'[Tite]
Public Const toParty = 13    'Miembros de la party
'[\Tite]
Public Const ToPUserAreaCercana = 14    'dos casillas
Public Const ToCiudadanos = 15
Public Const ToCriminales = 16
#If UsarQueSocket = 0 Then
    ' General constants used with most of the controls
    Public Const INVALID_HANDLE = -1
    Public Const CONTROL_ERRIGNORE = 0
    Public Const CONTROL_ERRDISPLAY = 1

    ' SocietWrench Control Actions
    Public Const SOCKET_OPEN = 1
    Public Const SOCKET_CONNECT = 2
    Public Const SOCKET_LISTEN = 3
    Public Const SOCKET_ACCEPT = 4
    Public Const SOCKET_CANCEL = 5
    Public Const SOCKET_FLUSH = 6
    Public Const SOCKET_CLOSE = 7
    Public Const SOCKET_DISCONNECT = 7
    Public Const SOCKET_ABORT = 8

    ' SocketWrench Control States
    Public Const SOCKET_NONE = 0
    Public Const SOCKET_IDLE = 1
    Public Const SOCKET_LISTENING = 2
    Public Const SOCKET_CONNECTING = 3
    Public Const SOCKET_ACCEPTING = 4
    Public Const SOCKET_RECEIVING = 5
    Public Const SOCKET_SENDING = 6
    Public Const SOCKET_CLOSING = 7

    ' Societ Address Families
    Public Const AF_UNSPEC = 0
    Public Const AF_UNIX = 1
    Public Const AF_INET = 2

    ' Societ Types
    Public Const SOCK_STREAM = 1
    Public Const SOCK_DGRAM = 2
    Public Const SOCK_RAW = 3
    Public Const SOCK_RDM = 4
    Public Const SOCK_SEQPACKET = 5

    ' Protocol Types
    Public Const IPPROTO_IP = 0
    Public Const IPPROTO_ICMP = 1
    Public Const IPPROTO_GGP = 2
    Public Const IPPROTO_TCP = 6
    Public Const IPPROTO_PUP = 12
    Public Const IPPROTO_UDP = 17
    Public Const IPPROTO_IDP = 22
    Public Const IPPROTO_ND = 77
    Public Const IPPROTO_RAW = 255
    Public Const IPPROTO_MAX = 256

    ' Network Addpesses
    Public Const INADDR_ANY = "0.0.0.0"
    Public Const INADDR_LOOPBACK = "127.0.0.1"
    Public Const INADDR_NONE = "255.055.255.255"

    ' Shutdown Values
    Public Const SOCKET_READ = 0
    Public Const SOCKET_WRITE = 1
    Public Const SOCKET_READWRITE = 2

    ' SocketWrench Error Pesponse
    Public Const SOCKET_ERRIGNORE = 0
    Public Const SOCKET_ERRDISPLAY = 1

    ' SocketWrench Error Aodes
    Public Const WSABASEERR = 24000
    Public Const WSAEINTR = 24004
    Public Const WSAEBADF = 24009
    Public Const WSAEACCES = 24013
    Public Const WSAEFAULT = 24014
    Public Const WSAEINVAL = 24022
    Public Const WSAEMFILE = 24024
    Public Const WSAEWOULDBLOCK = 24035
    Public Const WSAEINPROGRESS = 24036
    Public Const WSAEALREADY = 24037
    Public Const WSAENOTSOCK = 24038
    Public Const WSAEDESTADDRREQ = 24039
    Public Const WSAEMSGSIZE = 24040
    Public Const WSAEPROTOTYPE = 24041
    Public Const WSAENOPROTOOPT = 24042
    Public Const WSAEPROTONOSUPPORT = 24043
    Public Const WSAESOCKTNOSUPPORT = 24044
    Public Const WSAEOPNOTSUPP = 24045
    Public Const WSAEPFNOSUPPORT = 24046
    Public Const WSAEAFNOSUPPORT = 24047
    Public Const WSAEADDRINUSE = 24048
    Public Const WSAEADDRNOTAVAIL = 24049
    Public Const WSAENETDOWN = 24050
    Public Const WSAENETUNREACH = 24051
    Public Const WSAENETRESET = 24052
    Public Const WSAECONNABORTED = 24053
    Public Const WSAECONNRESET = 24054
    Public Const WSAENOBUFS = 24055
    Public Const WSAEISCONN = 24056
    Public Const WSAENOTCONN = 24057
    Public Const WSAESHUTDOWN = 24058
    Public Const WSAETOOMANYREFS = 24059
    Public Const WSAETIMEDOUT = 24060
    Public Const WSAECONNREFUSED = 24061
    Public Const WSAELOOP = 24062
    Public Const WSAENAMETOOLONG = 24063
    Public Const WSAEHOSTDOWN = 24064
    Public Const WSAEHOSTUNREACH = 24065
    Public Const WSAENOTEMPTY = 24066
    Public Const WSAEPROCLIM = 24067
    Public Const WSAEUSERS = 24068
    Public Const WSAEDQUOT = 24069
    Public Const WSAESTALE = 24070
    Public Const WSAEREMOTE = 24071
    Public Const WSASYSNOTREADY = 24091
    Public Const WSAVERNOTSUPPORTED = 24092
    Public Const WSANOTINITIALISED = 24093
    Public Const WSAHOST_NOT_FOUND = 25001
    Public Const WSATRY_AGAIN = 25002
    Public Const WSANO_RECOVERY = 25003
    Public Const WSANO_DATA = 25004
    Public Const WSANO_ADDRESS = 2500
#End If

Public Function GenCrC(ByVal key As Long, ByVal sdData As String) As Long

End Function

Sub DarCuerpoYCabeza(UserBody As Integer, _
                     userhead As Integer, _
                     raza As String, _
                     Gen As String)

    On Error GoTo fallo

    Select Case Gen

    Case "Hombre"

        Select Case raza

        Case "Humano"
            userhead = CInt(RandomNumber(3, 53))

            If userhead = 27 Then userhead = 28
            UserBody = 1

        Case "Abisario"
            userhead = CInt(RandomNumber(1, 4)) + 800

            If userhead > 804 Then userhead = 804
            UserBody = 488

        Case "Elfo"
            userhead = CInt(RandomNumber(1, 19)) + 100

            If userhead > 119 Then userhead = 119
            UserBody = 2

        Case "Elfo Oscuro"
            userhead = CInt(RandomNumber(1, 16)) + 200

            If userhead > 216 Then userhead = 216
            UserBody = 3

        Case "Enano"
            userhead = RandomNumber(1, 11) + 400

            If userhead > 411 Then userhead = 411
            UserBody = 52

            'pluto:7.0
        Case "Goblin"
            userhead = RandomNumber(1, 8) + 704

            If userhead > 712 Then userhead = 712
            UserBody = 178

        Case "Gnomo"
            userhead = RandomNumber(1, 15) + 300

            If userhead > 315 Then userhead = 315
            UserBody = 52

        Case "Orco"
            userhead = RandomNumber(1, 6) + 600

            If userhead > 606 Then userhead = 606
            UserBody = 218

        Case "Vampiro"
            userhead = RandomNumber(1, 8) + 504

            If userhead > 512 Then userhead = 512
            UserBody = 2
            
        Case "Tauros"
            userhead = RandomNumber(1, 4) + 919

            If userhead > 923 Then userhead = 923
            UserBody = 529

        Case "Licantropos"
            userhead = RandomNumber(1, 4) + 899

            If userhead > 903 Then userhead = 903
            UserBody = 531

        Case "NoMuerto"
            userhead = RandomNumber(1, 4) + 859

            If userhead > 863 Then userhead = 863
            UserBody = 527

        Case Else
            userhead = 1
            UserBody = 1

        End Select

    Case "Mujer"

        Select Case raza

        Case "Humano"
            userhead = CInt(RandomNumber(1, 13)) + 69

            If userhead > 82 Then userhead = 82
            UserBody = 1

        Case "Abisario"
            userhead = CInt(RandomNumber(1, 3)) + 850

            If userhead > 853 Then userhead = 853
            UserBody = 486

        Case "Elfo"
            userhead = CInt(RandomNumber(1, 11)) + 169

            If userhead > 180 Then userhead = 180
            UserBody = 2

        Case "Elfo Oscuro"
            userhead = CInt(RandomNumber(1, 8)) + 269

            If userhead > 277 Then userhead = 277
            UserBody = 3

            'pluto:7.0
        Case "Goblin"
            userhead = RandomNumber(1, 4) + 700

            If userhead > 704 Then userhead = 704
            UserBody = 212

        Case "Gnomo"
            userhead = RandomNumber(1, 4) + 369

            If userhead > 373 Then userhead = 373
            UserBody = 52

        Case "Enano"
            userhead = RandomNumber(1, 7) + 469

            If userhead > 476 Then userhead = 476
            UserBody = 52

        Case "Orco"
            userhead = RandomNumber(1, 3) + 606

            If userhead > 609 Then userhead = 609
            UserBody = 219

        Case "Vampiro"
            userhead = RandomNumber(1, 3) + 500

            If userhead > 503 Then userhead = 503
            UserBody = 3
            
        Case "Tauros"
            userhead = RandomNumber(1, 4) + 909

            If userhead > 913 Then userhead = 913
            UserBody = 528

        Case "Licantropos"
            userhead = RandomNumber(1, 4) + 889

            If userhead > 893 Then userhead = 893
            UserBody = 530

        Case "NoMuerto"
            userhead = RandomNumber(1, 4) + 879

            If userhead > 883 Then userhead = 883
            UserBody = 526

        Case Else
            userhead = 70
            UserBody = 1

        End Select

    End Select

    Exit Sub
fallo:
    Call LogError("darcuerpoycabeza " & Err.number & " D: " & Err.Description)

End Sub

Function AsciiValidos(ByVal cad As String) As Boolean

    On Error GoTo fallo

    Dim car As Byte
    Dim i As Integer

    cad = LCase$(cad)

    For i = 1 To Len(cad)
        car = Asc(mid$(cad, i, 1))

        If (car < 97 Or car > 122) And (car <> 255) And (car <> 32) And (car <> 64) And (car <> 46) Then
            AsciiValidos = False
            Exit Function

        End If

    Next i

    AsciiValidos = True
    Exit Function
fallo:
    Call LogError("asciivalidos " & Err.number & " D: " & Err.Description)

End Function

Function AsciiDescripcion(ByVal cad As String) As Boolean

    On Error GoTo fallo

    Dim car As Byte
    Dim i As Integer

    cad = LCase$(cad)

    For i = 1 To Len(cad)
        car = Asc(mid$(cad, i, 1))

        If (car < 97 Or car > 122) And (car <> 241) And (car <> 255) And (car <> 32) And (car <> 64) And (car <> 46) _
           Then
            AsciiDescripcion = False
            Exit Function

        End If

    Next i

    AsciiDescripcion = True
    Exit Function
fallo:
    Call LogError("asciidescripcion " & Err.number & " D: " & Err.Description)

End Function

Sub SendBot(Desc As String)

    On Error GoTo fallo

    Dim Tindex As Integer
    Tindex = NameIndex("AoDraGBoT")

    If Tindex > 0 Then
        Call SendData(ToIndex, Tindex, 0, "||" & Desc & "´" & FontTypeNames.FONTTYPE_talk)

    End If

    Exit Sub
fallo:
    Call LogError("SendBot " & Err.number & " D: " & Err.Description)

End Sub

Function Numeric(ByVal cad As String) As Boolean

    On Error GoTo fallo

    Dim car As Byte
    Dim i As Integer

    cad = LCase$(cad)

    For i = 1 To Len(cad)
        car = Asc(mid$(cad, i, 1))

        If (car < 48 Or car > 57) Then
            Numeric = False
            Exit Function

        End If

    Next i

    Numeric = True
    Exit Function
fallo:
    Call LogError("numeric " & Err.number & " D: " & Err.Description)

End Function

Function NombrePermitido(ByVal Nombre As String) As Boolean

    On Error GoTo fallo

    Dim i As Integer

    For i = 1 To UBound(ForbidenNames)

        If InStr(Nombre, ForbidenNames(i)) Then
            NombrePermitido = False
            Exit Function

        End If

    Next i

    NombrePermitido = True
    Exit Function
fallo:
    Call LogError("nombrepermitido " & Err.number & " D: " & Err.Description)

End Function

Function ValidateAtrib(ByVal Userindex As Integer) As Boolean

    On Error GoTo fallo

    Dim loopc As Integer

    For loopc = 1 To NUMATRIBUTOS
       If UserList(Userindex).Stats.UserAtributos(Constitucion) > 21 Or UserList(Userindex).Stats.UserAtributos(loopc) < 1 Then Exit Function
       If UserList(Userindex).Stats.UserAtributos(Inteligencia) > 22 Or UserList(Userindex).Stats.UserAtributos(loopc) < 1 Then Exit Function
       'If UserList(Userindex).Stats.UserAtributos(Agilidad) > 20 And Not UserList(Userindex).raza = "Elfo Oscuro" Then Exit Function
       'If UserList(Userindex).Stats.UserAtributos(Fuerza) > 20 And UserList(Userindex).raza <> "Enano" Then Exit Function
    Next loopc
    
    

    ValidateAtrib = True
    Exit Function
fallo:
    Call LogError("validateatrib " & Err.number & " D: " & Err.Description)

End Function

Function ValidateSkills(ByVal Userindex As Integer) As Boolean

    On Error GoTo fallo

    Dim loopc As Integer

    For loopc = 1 To NUMSKILLS

        If UserList(Userindex).Stats.UserSkills(loopc) < 0 Then
            Exit Function

            If UserList(Userindex).Stats.UserSkills(loopc) > 200 Then UserList(Userindex).Stats.UserSkills(loopc) = 200

        End If

    Next loopc

    ValidateSkills = True

    Exit Function
fallo:
    Call LogError("validateskills " & Err.number & " D: " & Err.Description)

End Function

Sub ConnectNewUser(Userindex As Integer, _
                   Name As String, _
                   Password As String, _
                   Body As Integer, _
                   Head As Integer, _
                   UserRaza As String, _
                   UserSexo As String, _
                   UserClase As String, _
                   UA1 As String, _
                   UA2 As String, _
                   UA3 As String, _
                   UA4 As String, _
                   UA5 As String, _
                   US1 As String, _
                   US2 As String, _
                   US3 As String, _
                   US4 As String, _
                   US5 As String, _
                   US6 As String, _
                   US7 As String, _
                   US8 As String, _
                   US9 As String, _
                   US10 As String, _
                   US11 As String, _
                   US12 As String, US13 As String, US14 As String, US15 As String, US16 As String, US17 As String, US18 As String, US19 As String, US20 As String, US21 As String, US22 As String, US23 As String, US24 As String, US25 As String, US26 As String, US27 As String, US28 As String, US29 As String, US30 As String, US31 As String, UserEmail As String, Hogar As String, Totalda As Integer, P1 As Byte, P2 As Byte, P3 As Byte, P4 As Byte, P5 As Byte, P6 As Byte, HeadC As Integer, BodyC As Integer)

    On Error GoTo fallo

    If Not NombrePermitido(Name) Then
        Call SendData2(ToIndex, Userindex, 0, 43, _
                       "Los nombres de los personajes deben pertencer a la fantasia, el nombre indicado es invalido.")
        Exit Sub

    End If

    'pluto:6.7
    If Left$(Name, 1) = " " Or Right$(Name, 1) = " " Then
        Call SendData2(ToIndex, Userindex, 0, 79, Userindex)
        Call LogError("Intento Nombre con Espacio: " & Name & " Ip:" & UserList(Userindex).ip)
        Exit Sub

    End If

    If Len(Name) > 15 Or Len(Name) < 4 Then
        Call SendData2(ToIndex, Userindex, 0, 43, "Nombre demasiado largo o demasiado corto.")
        Exit Sub

    End If

    If Not AsciiValidos(Name) Then
        Call SendData2(ToIndex, Userindex, 0, 43, "Nombre invalido.")
        Exit Sub

    End If

    Dim loopc As Integer
    Dim totalskpts As Long

    '¿Existe el personaje?
    If PersonajeExiste(Name) Then
        Call SendData2(ToIndex, Userindex, 0, 43, "Ya existe el personaje.")
        Exit Sub

    End If

    'pluto:6.0A
    Call SendData(ToAdmins, Userindex, 0, "|| Creado Pj : " & Name & "´" & FontTypeNames.FONTTYPE_talk)

    'pluto:5.2
    UserList(Userindex).flags.CMuerte = 1
    '--------
    UserList(Userindex).flags.Muerto = 0
    UserList(Userindex).flags.Escondido = 0
    UserList(Userindex).flags.Protec = 0
    UserList(Userindex).flags.Ron = 0
    UserList(Userindex).flags.LiderAlianza = 0
    UserList(Userindex).flags.LiderHorda = 0
    UserList(Userindex).flags.Revisar = 0
    UserList(Userindex).Reputacion.AsesinoRep = 0
    UserList(Userindex).Reputacion.BandidoRep = 0
    UserList(Userindex).Reputacion.BurguesRep = 0
    UserList(Userindex).Reputacion.LadronesRep = 0
    UserList(Userindex).Reputacion.NobleRep = 1000
    UserList(Userindex).Reputacion.PlebeRep = 30

    UserList(Userindex).Reputacion.Promedio = 30 / 6

    UserList(Userindex).Name = Name
    UserList(Userindex).clase = UserClase
    UserList(Userindex).raza = UserRaza
    UserList(Userindex).Genero = UserSexo
    UserList(Userindex).Email = Cuentas(Userindex).mail
    UserList(Userindex).Hogar = Hogar
    'pluto:2.14 --------------------
    UserList(Userindex).Padre = ""
    UserList(Userindex).Madre = ""

    UserList(Userindex).Nhijos = 0
    UserList(Userindex).Faccion.Castigo = 0
    Dim X As Byte

    For X = 1 To 5
        UserList(Userindex).Hijo(X) = ""
    Next
    '-------------------------------

    If Abs(CInt(UA1)) + Abs(CInt(UA2)) + Abs(CInt(UA3)) + Abs(CInt(UA4)) + Abs(CInt(UA5)) > 105 Then
        Call SendData2(ToIndex, Userindex, 0, 43, "Atributos invalidos.")
        Exit Sub

    End If

    UserList(Userindex).Stats.UserAtributos(Fuerza) = Abs(CInt(UA1))
    UserList(Userindex).Stats.UserAtributos(Inteligencia) = Abs(CInt(UA2))
    UserList(Userindex).Stats.UserAtributos(Agilidad) = Abs(CInt(UA3))
    UserList(Userindex).Stats.UserAtributos(Carisma) = Abs(CInt(UA4))
    UserList(Userindex).Stats.UserAtributos(Constitucion) = Abs(CInt(UA5))

    'pluto:7.0
    If (P1 + P2 + P3 + P4 + P5 + P6 > 15) Then
        Call SendData2(ToIndex, Userindex, 0, 43, "Atributos invalidos.")
        Exit Sub

    End If

    UserList(Userindex).UserDañoProyetilesRaza = P1
    UserList(Userindex).UserDañoArmasRaza = P2
    UserList(Userindex).UserDañoMagiasRaza = P3
    UserList(Userindex).UserDefensaMagiasRaza = P4
    UserList(Userindex).UserEvasiónRaza = P5
    UserList(Userindex).UserDefensaEscudos = P6

    UserList(Userindex).Remort = 0
    UserList(Userindex).Remorted = ""
    
   

    '%%%%%%%%%%%%% PREVENIR HACKEO DE LOS ATRIBUTOS %%%%%%%%%%%%%
    If Not ValidateAtrib(Userindex) Then
        Call SendData2(ToIndex, Userindex, 0, 43, "Atributos invalidos.")
        Exit Sub

    End If

    '%%%%%%%%%%%%% PREVENIR HACKEO DE LOS ATRIBUTOS %%%%%%%%%%%%%

    'pluto:7.0 quito todo esto para la nueva versión
    'Select Case UCase$(UserRaza)
    '   Case "HUMANO"
    '      UserList(UserIndex).Stats.UserAtributos(Fuerza) = UserList(UserIndex).Stats.UserAtributos(Fuerza) + 1
    '     UserList(UserIndex).Stats.UserAtributos(Agilidad) = UserList(UserIndex).Stats.UserAtributos(Agilidad) + 2
    '    UserList(UserIndex).Stats.UserAtributos(Constitucion) = UserList(UserIndex).Stats.UserAtributos(Constitucion) + 2
    '   UserList(UserIndex).Stats.UserAtributos(Inteligencia) = UserList(UserIndex).Stats.UserAtributos(Inteligencia) + 1
    ' Case "ELFO"
    '    UserList(UserIndex).Stats.UserAtributos(Agilidad) = UserList(UserIndex).Stats.UserAtributos(Agilidad) + 2
    '   UserList(UserIndex).Stats.UserAtributos(Inteligencia) = UserList(UserIndex).Stats.UserAtributos(Inteligencia) + 2
    '  UserList(UserIndex).Stats.UserAtributos(Carisma) = UserList(UserIndex).Stats.UserAtributos(Carisma) + 2
    ' UserList(UserIndex).Stats.UserAtributos(Constitucion) = UserList(UserIndex).Stats.UserAtributos(Constitucion) + 1
    'UserList(UserIndex).Stats.UserAtributos(Fuerza) = UserList(UserIndex).Stats.UserAtributos(Fuerza) - 1

    '   Case "ELFO OSCURO"
    '      UserList(UserIndex).Stats.UserAtributos(Agilidad) = UserList(UserIndex).Stats.UserAtributos(Agilidad) + 2
    '     UserList(UserIndex).Stats.UserAtributos(Inteligencia) = UserList(UserIndex).Stats.UserAtributos(Inteligencia) - 2
    '    UserList(UserIndex).Stats.UserAtributos(Carisma) = UserList(UserIndex).Stats.UserAtributos(Carisma) + 2
    '   UserList(UserIndex).Stats.UserAtributos(Constitucion) = UserList(UserIndex).Stats.UserAtributos(Constitucion) + 1
    '  UserList(UserIndex).Stats.UserAtributos(Fuerza) = UserList(UserIndex).Stats.UserAtributos(Fuerza) + 1
    'Case "ENANO"
    '   UserList(UserIndex).Stats.UserAtributos(Fuerza) = UserList(UserIndex).Stats.UserAtributos(Fuerza) + 3
    '  UserList(UserIndex).Stats.UserAtributos(Constitucion) = UserList(UserIndex).Stats.UserAtributos(Constitucion) + 3
    'pluto:6.0A cambio enano a -3 inte
    ' UserList(UserIndex).Stats.UserAtributos(Inteligencia) = UserList(UserIndex).Stats.UserAtributos(Inteligencia) - 3
    ' UserList(UserIndex).Stats.UserAtributos(Agilidad) = UserList(UserIndex).Stats.UserAtributos(Agilidad) - 1

    ' Case "GNOMO"
    '     UserList(UserIndex).Stats.UserAtributos(Fuerza) = UserList(UserIndex).Stats.UserAtributos(Fuerza) - 4
    '    UserList(UserIndex).Stats.UserAtributos(Inteligencia) = UserList(UserIndex).Stats.UserAtributos(Inteligencia) + 3
    '    UserList(UserIndex).Stats.UserAtributos(Agilidad) = UserList(UserIndex).Stats.UserAtributos(Agilidad) + 3
    '    UserList(UserIndex).Stats.UserAtributos(Constitucion) = UserList(UserIndex).Stats.UserAtributos(Constitucion) + 1

    ' Case "ORCO"
    '    UserList(UserIndex).Stats.UserAtributos(Fuerza) = UserList(UserIndex).Stats.UserAtributos(Fuerza) + 4
    '   UserList(UserIndex).Stats.UserAtributos(Agilidad) = UserList(UserIndex).Stats.UserAtributos(Agilidad) - 3
    '  UserList(UserIndex).Stats.UserAtributos(Constitucion) = UserList(UserIndex).Stats.UserAtributos(Constitucion) + 3
    ' UserList(UserIndex).Stats.UserAtributos(Inteligencia) = UserList(UserIndex).Stats.UserAtributos(Inteligencia) - 6
    ' Case "VAMPIRO"
    '     UserList(UserIndex).Stats.UserAtributos(Fuerza) = UserList(UserIndex).Stats.UserAtributos(Fuerza) + 2
    '    UserList(UserIndex).Stats.UserAtributos(Agilidad) = UserList(UserIndex).Stats.UserAtributos(Agilidad) + 2
    '   UserList(UserIndex).Stats.UserAtributos(Constitucion) = UserList(UserIndex).Stats.UserAtributos(Constitucion) + 2
    ' End Select

    UserList(Userindex).Stats.UserSkills(1) = val(US1)
    UserList(Userindex).Stats.UserSkills(2) = val(US2)
    UserList(Userindex).Stats.UserSkills(3) = val(US3)
    UserList(Userindex).Stats.UserSkills(4) = val(US4)
    UserList(Userindex).Stats.UserSkills(5) = val(US5)
    UserList(Userindex).Stats.UserSkills(6) = val(US6)
    UserList(Userindex).Stats.UserSkills(7) = val(US7)
    UserList(Userindex).Stats.UserSkills(8) = val(US8)
    UserList(Userindex).Stats.UserSkills(9) = val(US9)
    UserList(Userindex).Stats.UserSkills(10) = val(US10)
    UserList(Userindex).Stats.UserSkills(11) = val(US11)
    UserList(Userindex).Stats.UserSkills(12) = val(US12)
    UserList(Userindex).Stats.UserSkills(13) = val(US13)
    UserList(Userindex).Stats.UserSkills(14) = val(US14)
    UserList(Userindex).Stats.UserSkills(15) = val(US15)
    UserList(Userindex).Stats.UserSkills(16) = val(US16)
    UserList(Userindex).Stats.UserSkills(17) = val(US17)
    UserList(Userindex).Stats.UserSkills(18) = val(US18)
    UserList(Userindex).Stats.UserSkills(19) = val(US19)
    UserList(Userindex).Stats.UserSkills(20) = val(US20)
    UserList(Userindex).Stats.UserSkills(21) = val(US21)
    UserList(Userindex).Stats.UserSkills(22) = val(US22)
    UserList(Userindex).Stats.UserSkills(23) = val(US23)
    UserList(Userindex).Stats.UserSkills(24) = val(US24)
    UserList(Userindex).Stats.UserSkills(25) = val(US25)
    UserList(Userindex).Stats.UserSkills(26) = val(US26)
    UserList(Userindex).Stats.UserSkills(27) = val(US27)
    UserList(Userindex).Stats.UserSkills(28) = val(US28)
    UserList(Userindex).Stats.UserSkills(29) = val(US29)
    UserList(Userindex).Stats.UserSkills(30) = val(US30)
    UserList(Userindex).Stats.UserSkills(31) = val(US31)
    totalskpts = 10
    UserList(Userindex).Stats.SkillPts = 10
    UserList(Userindex).Stats.Elo = 1

    ' PREVINENE EL HACKEO DE LOS SKILLS %%%%%%%%%%%%%
    For loopc = 1 To NUMSKILLS

        If UserList(Userindex).Stats.UserSkills(loopc) > 0 Then
            Call LogError(" en Jugador:" & UserList(Userindex).Name & " Skills Trucados " & "Ip: " & UserList( _
                          Userindex).ip)

        End If

    Next loopc

    'If totalskpts > 10 Then
    '   Call LogHackAttemp(UserList(UserIndex).Name & " intento hackear los skills.")
    '    Call BorrarUsuario(UserList(userindex).name)
    '  Call CloseUser(UserIndex)
    ' Exit Sub
    'End If

    'pluto:2.14
    'If Totalda > (UserList(UserIndex).Stats.UserAtributos(1) + UserList(UserIndex).Stats.UserAtributos(2) + UserList(UserIndex).Stats.UserAtributos(3) + UserList(UserIndex).Stats.UserAtributos(4) + UserList(UserIndex).Stats.UserAtributos(5)) Then
    'Call LogCasino("Jugador:" & UserList(UserIndex).Name & " posibles Dados trucados " & "Ip: " & UserList(UserIndex).ip)
    'End If

    '%%%%%%%%%%%%% PREVENIR HACKEO DE LOS SKILLS %%%%%%%%%%%%%

    'UserList(userindex).password = password
    UserList(Userindex).Char.Heading = SOUTH

    Call Randomize(Timer)
    'Call DarCuerpoYCabeza(UserList(Userindex).Char.Body, UserList(Userindex).Char.Head, UserList(Userindex).raza, _
                          UserList(Userindex).Genero)
    UserList(Userindex).Char.Body = BodyC
    UserList(Userindex).Char.Head = HeadC
    UserList(Userindex).OrigChar = UserList(Userindex).Char
    


    UserList(Userindex).Char.WeaponAnim = NingunArma
    UserList(Userindex).Char.ShieldAnim = NingunEscudo
    UserList(Userindex).Char.CascoAnim = NingunCasco

    UserList(Userindex).Stats.MET = 1
    Dim MiInt
    MiInt = RandomNumber(1, UserList(Userindex).Stats.UserAtributos(Constitucion) \ 3)
    'MiInt = UserList(UserIndex).Stats.UserAtributos(Constitucion) \ 3
    UserList(Userindex).Stats.MaxHP = 15 + MiInt
    UserList(Userindex).Stats.MinHP = 15 + MiInt

    UserList(Userindex).Stats.FIT = 1

    MiInt = RandomNumber(1, UserList(Userindex).Stats.UserAtributos(Agilidad) \ 6)

    If MiInt = 1 Then MiInt = 2

    UserList(Userindex).Stats.MaxSta = 20 * MiInt
    UserList(Userindex).Stats.MinSta = 20 * MiInt

    UserList(Userindex).Stats.MaxAGU = 100
    UserList(Userindex).Stats.MinAGU = 100

    UserList(Userindex).Stats.MaxHam = 100
    UserList(Userindex).Stats.MinHam = 100

    '<-----------------MANA----------------------->
    If UserClase = "Mago" Then
        MiInt = RandomNumber(1, UserList(Userindex).Stats.UserAtributos(Inteligencia)) / 3
        UserList(Userindex).Stats.MaxMAN = 100 + MiInt
        UserList(Userindex).Stats.MinMAN = 100 + MiInt
    ElseIf UserClase = "Clerigo" Or UserClase = "Druida" Or UserClase = "Bardo" Or UserClase = "Asesino" Or UserClase _
           = "Pirata" Then
        MiInt = RandomNumber(1, UserList(Userindex).Stats.UserAtributos(Inteligencia)) / 4
        UserList(Userindex).Stats.MaxMAN = 50
        UserList(Userindex).Stats.MinMAN = 50
    Else
        UserList(Userindex).Stats.MaxMAN = 0
        UserList(Userindex).Stats.MinMAN = 0

    End If
    
    If UserRaza = "Humano" Or UserRaza = "Elfo" Or UserRaza = "Enano" Or UserRaza = "Gnomo" Or UserRaza = "Tauros" Or UserRaza = "Abisario" Then
    UserList(Userindex).Faccion.ArmadaReal = 1
    UserList(Userindex).Faccion.SoyReal = 1
    End If
    
    If UserRaza = "Orco" Or UserRaza = "Licantropos" Or UserRaza = "Vampiro" Or UserRaza = "Goblin" Or UserRaza = "NoMuerto" Or UserRaza = "Elfo Oscuro" Then
    UserList(Userindex).Faccion.FuerzasCaos = 1
    UserList(Userindex).Faccion.SoyCaos = 1
    End If

    If UserClase = "Mago" Or UserClase = "Clerigo" Or UserClase = "Druida" Or UserClase = "Bardo" Or UserClase = _
       "Asesino" Then
        UserList(Userindex).Stats.UserHechizos(1) = 2

    End If
    

    UserList(Userindex).Stats.MaxHIT = 2
    UserList(Userindex).Stats.MinHIT = 1
    UserList(Userindex).Stats.Fama = 0
    UserList(Userindex).Stats.GLD = 0
    UserList(Userindex).Stats.LibrosUsados = 0
    UserList(Userindex).Stats.exp = 0
    UserList(Userindex).Stats.Elu = 300
    UserList(Userindex).Stats.ELV = 1
    'UserList(Userindex).Faccion.ArmadaReal = 2

    '???????????????? INVENTARIO ¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿¿
    UserList(Userindex).Invent.NroItems = 4

    UserList(Userindex).Invent.Object(1).ObjIndex = 467
    UserList(Userindex).Invent.Object(1).Amount = 100

    UserList(Userindex).Invent.Object(2).ObjIndex = 468
    UserList(Userindex).Invent.Object(2).Amount = 100

    UserList(Userindex).Invent.Object(3).ObjIndex = 460
    UserList(Userindex).Invent.Object(3).Amount = 1
    UserList(Userindex).Invent.Object(3).Equipped = 1


    'pluto:7.0--- añado arcos y flechas newbies-------
    If UserClase = "Arquero" Or UserClase = "Cazador" Or UserClase = "Leñador" Or UserClase = "Minero" Or UserClase = _
       "Pescador" Or UserClase = "Ermitaño" Or UserClase = "Domador" Or UserClase = "Carpintero" Or UserClase = _
       "Herrero" Then
        UserList(Userindex).Invent.Object(6).ObjIndex = 1280
        UserList(Userindex).Invent.Object(6).Amount = 1
        UserList(Userindex).Invent.Object(6).Equipped = 0
        UserList(Userindex).Invent.Object(7).ObjIndex = 1281
        UserList(Userindex).Invent.Object(7).Amount = 500
        UserList(Userindex).Invent.Object(7).Equipped = 0

    End If

    '---------------------------------------------------
    Select Case UserRaza

    Case "Humano"
        UserList(Userindex).Invent.Object(4).ObjIndex = 463

    Case "Elfo"
        UserList(Userindex).Invent.Object(4).ObjIndex = 464

    Case "Elfo Oscuro"
        UserList(Userindex).Invent.Object(4).ObjIndex = 465

    Case "Enano"
        UserList(Userindex).Invent.Object(4).ObjIndex = 466

    Case "Gnomo"
        UserList(Userindex).Invent.Object(4).ObjIndex = 466

    Case "Vampiro"
        UserList(Userindex).Invent.Object(4).ObjIndex = 465

    Case "Orco"

        If UserList(Userindex).Genero = "Mujer" Then
            UserList(Userindex).Invent.Object(4).ObjIndex = 737
        Else
            UserList(Userindex).Invent.Object(4).ObjIndex = 736

        End If

        'pluto:7.0
    Case "Goblin"
        UserList(Userindex).Invent.Object(4).ObjIndex = 466

    Case "Abisario"
        UserList(Userindex).Invent.Object(4).ObjIndex = 464
        
    Case "Tauros"
        UserList(Userindex).Invent.Object(4).ObjIndex = 463
        
    Case "Licantropos"
        UserList(Userindex).Invent.Object(4).ObjIndex = 463
        
    Case "NoMuerto"
        UserList(Userindex).Invent.Object(4).ObjIndex = 463

    End Select

    UserList(Userindex).Invent.Object(4).Amount = 1
    UserList(Userindex).Invent.Object(4).Equipped = 1

    UserList(Userindex).Invent.ArmourEqpSlot = 4
    UserList(Userindex).Invent.ArmourEqpObjIndex = UserList(Userindex).Invent.Object(4).ObjIndex

    UserList(Userindex).Invent.WeaponEqpObjIndex = UserList(Userindex).Invent.Object(3).ObjIndex
    UserList(Userindex).Invent.WeaponEqpSlot = 3

    Call SaveUser(Userindex, CharPath & Left$(UCase$(Name), 1) & "\" & UCase$(Name) & ".chr")

    'Open User
    'Call ConnectUser(userindex, name, password)
    Cuentas(Userindex).NumPjs = Cuentas(Userindex).NumPjs + 1
    ReDim Preserve Cuentas(Userindex).Pj(1 To Cuentas(Userindex).NumPjs)
    Cuentas(Userindex).Pj(Cuentas(Userindex).NumPjs) = Name

    'pluto:6.6----------
    Call ResetUserSlot(Userindex)
    '--------------------
    Call MandaPersonajes(Userindex)

    'pluto:2.4.5
    'Dim x As Integer
    Call WriteVar(AccPath & Cuentas(Userindex).mail & ".acc", "DATOS", "Password", Cuentas(Userindex).passwd)
    Call WriteVar(AccPath & Cuentas(Userindex).mail & ".acc", "DATOS", "NumPjs", CStr(Cuentas(Userindex).NumPjs))
    Call WriteVar(AccPath & Cuentas(Userindex).mail & ".acc", "DATOS", "Llave", CStr(Cuentas(Userindex).Llave))

    For X = 1 To Cuentas(Userindex).NumPjs
        Call WriteVar(AccPath & Cuentas(Userindex).mail & ".acc", "PERSONAJES", "PJ" & X, Cuentas(Userindex).Pj(X))
    Next
    'pluto:6.0A
    Call SendData(ToIndex, Userindex, 0, "AWIntro")



    Exit Sub
fallo:
    Call LogError("connectnewuser " & Err.number & " D: " & Err.Description)

End Sub

#If UsarQueSocket = 1 Or UsarQueSocket = 2 Then

Sub CloseSocket(ByVal Userindex As Integer, Optional ByVal cerrarlo As Boolean = True)
'<<<<<<<<<<<<<<<<<< NO TOCAR >>>>>>>>>>>>>>>>>>>>>>
'<<<<<<<<<<<<<<<<<< NO TOCAR >>>>>>>>>>>>>>>>>>>>>>
'<<<<<<<<<<<<<<<<<< NO TOCAR >>>>>>>>>>>>>>>>>>>>>>

    Dim loopc As Integer

    If Userindex = Subastas.comprador Then Subastas.CompradorQuisoSalir = 1: Exit Sub
    If Userindex = Subastas.Vendedor Then Subastas.VendedorQuisoSalir = 1: Exit Sub

    'Call LogTarea("Close Socket")

    '#If UsarQueSocket = 0 Or UsarQueSocket = 2 Then
    On Error GoTo errhandler

    '#End If

    If Userindex = LastUser Then

        Do Until UserList(LastUser).flags.UserLogged
            LastUser = LastUser - 1

            If LastUser < 1 Then Exit Do
        Loop

    End If

    '<<<<<<<<<<<<<<<<<< NO TOCAR >>>>>>>>>>>>>>>>>>>>>>
    '<<<<<<<<<<<<<<<<<< NO TOCAR >>>>>>>>>>>>>>>>>>>>>>
    '<<<<<<<<<<<<<<<<<< NO TOCAR >>>>>>>>>>>>>>>>>>>>>>

    Call aDos.RestarConexion(UserList(Userindex).ip)

    If UserList(Userindex).ConnID <> -1 Then
        Call CloseSocketSL(Userindex)

    End If

    '<<<<<<<<<<<<<<<<<< NO TOCAR >>>>>>>>>>>>>>>>>>>>>>
    '<<<<<<<<<<<<<<<<<< NO TOCAR >>>>>>>>>>>>>>>>>>>>>>
    '<<<<<<<<<<<<<<<<<< NO TOCAR >>>>>>>>>>>>>>>>>>>>>>

    If UserList(Userindex).flags.UserLogged Then
        'If NumUsers > 0 Then NumUsers = NumUsers - 1
        Call CloseUser(Userindex)

        'Call EstadisticasWeb.Informar(CANTIDAD_ONLINE, NumUsers)
    Else
        Call ResetUserSlot(Userindex)
        UserList(Userindex).ip = ""
        UserList(Userindex).RDBuffer = ""

    End If

    '<<<<<<<<<<<<<<<<<< NO TOCAR >>>>>>>>>>>>>>>>>>>>>>
    '<<<<<<<<<<<<<<<<<< NO TOCAR >>>>>>>>>>>>>>>>>>>>>>
    '<<<<<<<<<<<<<<<<<< NO TOCAR >>>>>>>>>>>>>>>>>>>>>>

    '    #If UsarQueSocket = 1 Then
    '
    '    If UserList(UserIndex).ConnID <> -1 Then
    '        Call CloseSocketSL(UserIndex)
    '    End If
    '
    '    #ElseIf UsarQueSocket = 0 Then
    '
    '    'frmMain.Socket2(UserIndex).D i s c o n n e c t   NO USAR
    '    frmMain.Socket2(UserIndex).Cleanup
    '    Unload frmMain.Socket2(UserIndex)
    '
    '    #ElseIf UsarQueSocket = 2 Then
    '
    '    If UserList(UserIndex).ConnID <> -1 Then
    '        Call CloseSocketSL(UserIndex)
    '    End If
    '
    '    #End If

    '<<<<<<<<<<<<<<<<<< NO TOCAR >>>>>>>>>>>>>>>>>>>>>>
    '<<<<<<<<<<<<<<<<<< NO TOCAR >>>>>>>>>>>>>>>>>>>>>>
    '<<<<<<<<<<<<<<<<<< NO TOCAR >>>>>>>>>>>>>>>>>>>>>>

    'pluto fusion
    Call DesconectaCuenta(Userindex)
    UserList(Userindex).flags.ValCoDe = 0
    '-----------------------------

    UserList(Userindex).ConnID = -1
    UserList(Userindex).ConnIDValida = False
    UserList(Userindex).NumeroPaquetesPorMiliSec = 0

    Exit Sub

errhandler:
    UserList(Userindex).ConnID = -1
    UserList(Userindex).ConnIDValida = False
    UserList(Userindex).NumeroPaquetesPorMiliSec = 0
    '    Unload frmMain.Socket2(UserIndex) OJOOOOOOOOOOOOOOOOO
    '    If NumUsers > 0 Then NumUsers = NumUsers - 1
    'pluto fusion
    Call DesconectaCuenta(Userindex)
    '-----------------------------
    Call ResetUserSlot(Userindex)
    UserList(Userindex).ip = ""
    UserList(Userindex).RDBuffer = ""
    '<<<<<<<<<<<<<<<<<< NO TOCAR >>>>>>>>>>>>>>>>>>>>>>
    '<<<<<<<<<<<<<<<<<< NO TOCAR >>>>>>>>>>>>>>>>>>>>>>
    '<<<<<<<<<<<<<<<<<< NO TOCAR >>>>>>>>>>>>>>>>>>>>>>

    #If UsarQueSocket = 1 Then

        If UserList(Userindex).ConnID <> -1 Then
            Call CloseSocketSL(Userindex)

            '        Call apiclosesocket(UserList(UserIndex).ConnID)
        End If

    #End If
    '<<<<<<<<<<<<<<<<<< NO TOCAR >>>>>>>>>>>>>>>>>>>>>>
    '<<<<<<<<<<<<<<<<<< NO TOCAR >>>>>>>>>>>>>>>>>>>>>>
    '<<<<<<<<<<<<<<<<<< NO TOCAR >>>>>>>>>>>>>>>>>>>>>>

End Sub

#ElseIf UsarQueSocket = 0 Then

Sub CloseSocket(ByVal Userindex As Integer)

'<<<<<<<<<<<<<<<<<< NO TOCAR >>>>>>>>>>>>>>>>>>>>>>
'<<<<<<<<<<<<<<<<<< NO TOCAR >>>>>>>>>>>>>>>>>>>>>>
'<<<<<<<<<<<<<<<<<< NO TOCAR >>>>>>>>>>>>>>>>>>>>>>

'Call LogTarea("Close Socket")

    On Error GoTo errhandler

    '<<<<<<<<<<<<<<<<<< NO TOCAR >>>>>>>>>>>>>>>>>>>>>>
    '<<<<<<<<<<<<<<<<<< NO TOCAR >>>>>>>>>>>>>>>>>>>>>>
    '<<<<<<<<<<<<<<<<<< NO TOCAR >>>>>>>>>>>>>>>>>>>>>>


    Call aDos.RestarConexion(frmMain.Socket2(Userindex).PeerAddress)

    UserList(Userindex).ConnID = -1
    '    GameInputMapArray(UserIndex) = -1
    UserList(Userindex).NumeroPaquetesPorMiliSec = 0

    '<<<<<<<<<<<<<<<<<< NO TOCAR >>>>>>>>>>>>>>>>>>>>>>
    '<<<<<<<<<<<<<<<<<< NO TOCAR >>>>>>>>>>>>>>>>>>>>>>
    '<<<<<<<<<<<<<<<<<< NO TOCAR >>>>>>>>>>>>>>>>>>>>>>

    If Userindex = LastUser And LastUser > 1 Then
        Do Until UserList(LastUser).flags.UserLogged
            LastUser = LastUser - 1
            If LastUser <= 1 Then Exit Do
        Loop
    End If

    '<<<<<<<<<<<<<<<<<< NO TOCAR >>>>>>>>>>>>>>>>>>>>>>
    '<<<<<<<<<<<<<<<<<< NO TOCAR >>>>>>>>>>>>>>>>>>>>>>
    '<<<<<<<<<<<<<<<<<< NO TOCAR >>>>>>>>>>>>>>>>>>>>>>

    If UserList(Userindex).flags.UserLogged Then
        'If NumUsers <> 0 Then NumUsers = NumUsers - 1
        Call CloseUser(Userindex)
    End If

    '<<<<<<<<<<<<<<<<<< NO TOCAR >>>>>>>>>>>>>>>>>>>>>>
    '<<<<<<<<<<<<<<<<<< NO TOCAR >>>>>>>>>>>>>>>>>>>>>>
    '<<<<<<<<<<<<<<<<<< NO TOCAR >>>>>>>>>>>>>>>>>>>>>>

    frmMain.Socket2(Userindex).Cleanup
    '    frmMain.Socket2(UserIndex).Di    s  c o       n nect
    Unload frmMain.Socket2(Userindex)
    Call ResetUserSlot(Userindex)
    UserList(Userindex).flags.ValCoDe = 0

    '<<<<<<<<<<<<<<<<<< NO TOCAR >>>>>>>>>>>>>>>>>>>>>>
    '<<<<<<<<<<<<<<<<<< NO TOCAR >>>>>>>>>>>>>>>>>>>>>>
    '<<<<<<<<<<<<<<<<<< NO TOCAR >>>>>>>>>>>>>>>>>>>>>>

    Exit Sub

errhandler:
    UserList(Userindex).ConnID = -1
    '    GameInputMapArray(UserIndex) = -1
    UserList(Userindex).NumeroPaquetesPorMiliSec = 0
    '    Unload frmMain.Socket2(UserIndex) OJOOOOOOOOOOOOOOOOO
    '    If NumUsers > 0 Then NumUsers = NumUsers - 1
    Call ResetUserSlot(Userindex)

    '<<<<<<<<<<<<<<<<<< NO TOCAR >>>>>>>>>>>>>>>>>>>>>>
    '<<<<<<<<<<<<<<<<<< NO TOCAR >>>>>>>>>>>>>>>>>>>>>>
    '<<<<<<<<<<<<<<<<<< NO TOCAR >>>>>>>>>>>>>>>>>>>>>>

End Sub







#ElseIf UsarQueSocket = 3 Then

Sub CloseSocket(ByVal Userindex As Integer, Optional ByVal cerrarlo As Boolean = True)

    On Error GoTo errhandler

    Dim NURestados As Boolean
    Dim CoNnEcTiOnId As Long
    
    'If Userindex = Subastas.comprador Then Subastas.CompradorQuisoSalir = 1: Exit Sub
    'If Userindex = Subastas.Vendedor Then Subastas.VendedorQuisoSalir = 1: Exit Sub


    NURestados = False
    'pluto:2.14
    If Userindex = 0 Then Exit Sub
    CoNnEcTiOnId = UserList(Userindex).ConnID

    'call logindex(UserIndex, "******> Sub CloseSocket. ConnId: " & CoNnEcTiOnId & " Cerrarlo: " & Cerrarlo)

    Call aDos.RestarConexion(UserList(Userindex).ip)

    UserList(Userindex).ConnID = -1    'inabilitamos operaciones en socket
    UserList(Userindex).NumeroPaquetesPorMiliSec = 0

    If Userindex = LastUser And LastUser > 1 Then
        Do
            LastUser = LastUser - 1
            If LastUser <= 1 Then Exit Do
        Loop While UserList(LastUser).ConnID = -1
    End If

    If UserList(Userindex).flags.UserLogged Then
        'If NumUsers <> 0 Then NumUsers = NumUsers - 1
        NURestados = True
        Call CloseUser(Userindex)
    End If
    'pluto:2.13
    If Cuentas(Userindex).Logged = True Then
        'If NumUsers <> 0 Then NumUsers = NumUsers - 1
        NURestados = True
        Call DesconectaCuenta(Userindex)
    End If

    Call ResetUserSlot(Userindex)

    'limpiada la userlist... reseteo el socket, si me lo piden
    'Me lo piden desde: cerrada intecional del servidor (casi todas
    'las llamadas a CloseSocket del codigo)
    'No me lo piden desde: disconnect remoto (el on_close del control
    'de alejo realiza la desconexion automaticamente). Esto puede pasar
    'por ejemplo, si el cliente cierra el AO.
    If cerrarlo Then Call frmMain.TCPServ.CerrarSocket(CoNnEcTiOnId)

    Exit Sub

errhandler:
    UserList(Userindex).NumeroPaquetesPorMiliSec = 0
    Call LogError("CLOSESOCKETERR: " & Err.Description & " UI:" & Userindex)
    If Not NURestados Then
        If UserList(Userindex).flags.UserLogged Then
            If NumUsers <> 0 Then
                NumUsers = NumUsers - 1
            End If

            Call LogError("Cerre sin grabar a: " & UserList(Userindex).Name)
        End If
    End If
    Call LogError("El usuario no guardado tenia connid " & CoNnEcTiOnId & ". Socket no liberado.")
    Call ResetUserSlot(Userindex)
    'pluto:2.13
    If Cuentas(Userindex).Logged = True Then
        Call DesconectaCuenta(Userindex)
    End If
End Sub

#End If

'[Alejo-21-5]: Cierra un socket sin limpiar el slot
Sub CloseSocketSL(ByVal Userindex As Integer)
    Debug.Print "CloseSocketSL"

    #If UsarQueSocket = 1 Then

        If UserList(Userindex).ConnID <> -1 And UserList(Userindex).ConnIDValida Then

            Call BorraSlotSock(UserList(Userindex).ConnID)
            '    Call WSAAsyncSelect(UserList(UserIndex).ConnID, hWndMsg, ByVal 1025, ByVal (FD_CLOSE))
            '    Call apiclosesocket(UserList(UserIndex).ConnID)
            'pluto fusion
            Call DesconectaCuenta(Userindex)
            UserList(Userindex).flags.ValCoDe = 0
            '-----------------------------

            Call WSApiCloseSocket(UserList(Userindex).ConnID)
            UserList(Userindex).ConnIDValida = False

        End If

    #ElseIf UsarQueSocket = 0 Then

        If UserList(Userindex).ConnID <> -1 And UserList(Userindex).ConnIDValida Then
            'frmMain.Socket2(UserIndex).Disconnect
            frmMain.Socket2(Userindex).Cleanup
            Unload frmMain.Socket2(Userindex)
            UserList(Userindex).ConnIDValida = False

        End If

    #ElseIf UsarQueSocket = 2 Then

        If UserList(Userindex).ConnID <> -1 And UserList(Userindex).ConnIDValida Then
            Call frmMain.Serv.CerrarSocket(UserList(Userindex).ConnID)
            UserList(Userindex).ConnIDValida = False

        End If

    #End If

End Sub

'Sub CloseSocket_NUEVA(ByVal UserIndex As Integer)
''<<<<<<<<<<<<<<<<<< NO TOCAR >>>>>>>>>>>>>>>>>>>>>>
''<<<<<<<<<<<<<<<<<< NO TOCAR >>>>>>>>>>>>>>>>>>>>>>
''<<<<<<<<<<<<<<<<<< NO TOCAR >>>>>>>>>>>>>>>>>>>>>>
'
''Call LogTarea("Close Socket")
'
'on error GoTo errhandler
'
'
'
'    Call aDos.RestarConexion(frmMain.Socket2(UserIndex).PeerAddress)
'
'    'UserList(UserIndex).ConnID = -1
'    'UserList(UserIndex).NumeroPaquetesPorMiliSec = 0
'
'    If UserList(UserIndex).flags.UserLogged Then
'        If NumUsers <> 0 Then NumUsers = NumUsers - 1
'        Call CloseUser(UserIndex)
'        UserList(UserIndex).ConnID = -1: UserList(UserIndex).NumeroPaquetesPorMiliSec = 0
'        frmMain.Socket2(UserIndex).Disconnect
'        frmMain.Socket2(UserIndex).Cleanup
'        'Unload frmMain.Socket2(UserIndex)
'        Call ResetUserSlot(UserIndex)
'        'Call Cerrar_Usuario(UserIndex)
'    Else
'        UserList(UserIndex).ConnID = -1
'        UserList(UserIndex).NumeroPaquetesPorMiliSec = 0
'
'        frmMain.Socket2(UserIndex).Disconnect
'        frmMain.Socket2(UserIndex).Cleanup
'        Call ResetUserSlot(UserIndex)
'        'Unload frmMain.Socket2(UserIndex)
'    End If
'
'Exit Sub
'
'errhandler:
'    UserList(UserIndex).ConnID = -1
'    UserList(UserIndex).NumeroPaquetesPorMiliSec = 0
''    Unload frmMain.Socket2(UserIndex) OJOOOOOOOOOOOOOOOOO
''    If NumUsers > 0 Then NumUsers = NumUsers - 1
'    Call ResetUserSlot(UserIndex)
'
''<<<<<<<<<<<<<<<<<< NO TOCAR >>>>>>>>>>>>>>>>>>>>>>
''<<<<<<<<<<<<<<<<<< NO TOCAR >>>>>>>>>>>>>>>>>>>>>>
''<<<<<<<<<<<<<<<<<< NO TOCAR >>>>>>>>>>>>>>>>>>>>>>
'
'End Sub

Public Function EnviarDatosASlot(ByVal Userindex As Integer, Datos As String) As Long
'Call AddtoVar(UserList(LoopC).BytesTransmitidosSvr, LenB(sndData), 100000)

'TCPESStats.BytesEnviados = TCPESStats.BytesEnviados + Len(Datos)

    #If UsarQueSocket = 1 Then    '**********************************************

        On Error GoTo Err

        Dim ret As Long

        If frmMain.SUPERLOG.value = 1 Then LogCustom ("EnviarDatosASlot:: INICIO. userindex=" & Userindex & " datos=" _
                                                      & Datos & " UL?/CId/CIdV?=" & UserList(Userindex).flags.UserLogged & "/" & UserList(Userindex).ConnID _
                                                      & "/" & UserList(Userindex).ConnIDValida)

        ret = WsApiEnviar(Userindex, Datos)

        If frmMain.SUPERLOG.value = 1 Then LogCustom ("EnviarDatosASlot:: INICIO. Acabo de enviar userindex=" & _
                                                      Userindex & " datos=" & Datos & " UL?/CId/CIdV?=" & UserList(Userindex).flags.UserLogged & "/" & _
                                                      UserList(Userindex).ConnID & "/" & UserList(Userindex).ConnIDValida & " RET=" & ret)

        If ret <> 0 And ret <> WSAEWOULDBLOCK Then
            If frmMain.SUPERLOG.value = 1 Then LogCustom ( _
               "EnviarDatosASlot:: Entro a manejo de error. <> wsaewouldblock, <>0. userindex=" & Userindex & _
               " datos=" & Datos & " UL?/CId/CIdV?=" & UserList(Userindex).flags.UserLogged & "/" & UserList( _
               Userindex).ConnID & "/" & UserList(Userindex).ConnIDValida)
            Call CloseSocketSL(Userindex)

            If frmMain.SUPERLOG.value = 1 Then LogCustom ("EnviarDatosASlot:: Luego de Closesocket. userindex=" & _
                                                          Userindex & " datos=" & Datos & " UL?/CId/CIdV?=" & UserList(Userindex).flags.UserLogged & "/" & _
                                                          UserList(Userindex).ConnID & "/" & UserList(Userindex).ConnIDValida)
            Call Cerrar_Usuario(Userindex)

            If frmMain.SUPERLOG.value = 1 Then LogCustom ("EnviarDatosASlot:: Luego de Cerrar_usuario. userindex=" & _
                                                          Userindex & " datos=" & Datos & " UL?/CId/CIdV?=" & UserList(Userindex).flags.UserLogged & "/" & _
                                                          UserList(Userindex).ConnID & "/" & UserList(Userindex).ConnIDValida)

        End If

        EnviarDatosASlot = ret
        Exit Function

Err:

        If frmMain.SUPERLOG.value = 1 Then LogCustom ("EnviarDatosASlot:: ERR Handler. userindex=" & Userindex & _
                                                      " datos=" & Datos & " UL?/CId/CIdV?=" & UserList(Userindex).flags.UserLogged & "/" & UserList( _
                                                      Userindex).ConnID & "/" & UserList(Userindex).ConnIDValida & " ERR: " & Err.Description)

    #ElseIf UsarQueSocket = 0 Then    '**********************************************

        Dim Encolar As Boolean
        Encolar = False

        EnviarDatosASlot = 0

        'Dim fR As Integer
        'fR = FreeFile
        'Open "c:\log.txt" For Append As #fR
        'Print #fR, Datos
        'Close #fR
        'Call frmMain.Socket2(UserIndex).Write(Datos, Len(Datos))

        'If frmMain.Socket2(UserIndex).IsWritable And UserList(UserIndex).SockPuedoEnviar Then
        If UserList(Userindex).ColaSalida.Count <= 0 Then
            If frmMain.Socket2(Userindex).Write(Datos, Len(Datos)) < 0 Then
                If frmMain.Socket2(Userindex).LastError = WSAEWOULDBLOCK Then
                    UserList(Userindex).SockPuedoEnviar = False
                    Encolar = True
                Else
                    Call Cerrar_Usuario(Userindex)

                End If

                '    Else
                '        Debug.Print UserIndex & ": " & Datos
            End If

        Else
            Encolar = True

        End If

        If Encolar Then
            Debug.Print "Encolando..."
            UserList(Userindex).ColaSalida.Add Datos

        End If

    #ElseIf UsarQueSocket = 2 Then    '**********************************************

        Dim Encolar As Boolean
        Dim ret As Long
        Encolar = False

        '//
        '// Valores de retorno:
        '//                     0: Todo OK
        '//                     1: WSAEWOULDBLOCK
        '//                     2: Error critico
        '//
        If UserList(Userindex).ColaSalida.Count <= 0 Then
            ret = frmMain.Serv.Enviar(UserList(Userindex).ConnID, Datos, Len(Datos))

            If ret = 1 Then
                Encolar = True
            ElseIf ret = 2 Then
                Call CloseSocketSL(Userindex)
                Call Cerrar_Usuario(Userindex)

            End If

        Else
            Encolar = True

        End If

        If Encolar Then
            Debug.Print "Encolando..."
            UserList(Userindex).ColaSalida.Add Datos

        End If

    #ElseIf UsarQueSocket = 3 Then
        Dim rv As Long

        'al carajo, esto encola solo!!! che, me aprobará los
        'parciales también?, este control hace todo solo!!!!
        On Error GoTo ErrorHandler

        If UserList(Userindex).ConnID = -1 Then
            Call LogError("TCP::EnviardatosASlot, se intento enviar datos a un userIndex con ConnId=-1")
            Exit Function

        End If

        rv = frmMain.TCPServ.Enviar(UserList(Userindex).ConnID, Datos, Len(Datos))

        'pluto:6.7---------------------
        'UserList(UserIndex).Counters.UserEnvia = UserList(UserIndex).Counters.UserEnvia + 1
        'If UserList(UserIndex).Counters.UserEnvia > 50 Then UserList(UserIndex).Counters.UserEnvia = 1
        '----------------------------
        'If InStr(1, Datos, "VAL", vbTextCompare) > 0 Or InStr(1, Datos, "LOG", vbTextCompare) > 0 Or InStr(1, Datos, "FINO", vbTextCompare) > 0 Or InStr(1, Datos, "ERR", vbTextCompare) > 0 Then
        'call logindex(UserIndex, "SendData. ConnId: " & UserList(UserIndex).ConnID & " Datos: " & Datos)
        'End If
        Select Case rv

            'Case 1  'error critico, se viene el on_close
        Case 2  'Socket Invalido.
            'intentemos cerrarlo?
            Call CloseSocket(Userindex, True)

            'Case 3  'WSAEWOULDBLOCK. Solo si Encolar=False en el control
            'aca hariamos manejo de encoladas, pero el server se encarga solo :D
        End Select

        Exit Function
ErrorHandler:
        Call LogError("TCP::EnviarDatosASlot. UI/ConnId/Datos: " & Userindex & "/" & UserList(Userindex).ConnID & "/" _
                      & Datos)
    #End If    '**********************************************

End Function

Sub SendData2(sndRoute As Byte, _
              sndIndex As Integer, _
              sndMap As Integer, _
              ID As Byte, _
              Optional ByVal Param As String = "")

    On Error GoTo fallo

    Call SendData(sndRoute, sndIndex, sndMap, Chr$(5) & Chr$(ID) & Param)
    Exit Sub
fallo:
    Call LogError("sendata2 " & Err.number & " D: " & Err.Description)

End Sub

Sub SendData(sndRoute As Byte, sndIndex As Integer, sndMap As Integer, sndData As String)

    On Error GoTo fallo

    Dim loopc As Integer
    Dim X As Integer
    Dim Y As Integer
    Dim aux$
    Dim dec$
    Dim nfile As Integer
    Dim ret As Long
    Dim sndDato As String
    Dim aa As String
    Dim bb As String
    bb = sndData
    sndData = sndData & ENDC
    aa = sndData
    'pluto:2.8.0
    'DoEvents

    'If sndIndex = 0 Then GoTo nop

    Select Case sndRoute

    Case ToNone
        Exit Sub

    Case ToAdmins

        For loopc = 1 To LastUser

            If UserList(loopc).ConnID > -1 And UserList(loopc).flags.UserLogged = True Then
                If EsDios(UserList(loopc).Name) Or EsSemiDios(UserList(loopc).Name) Then

                    'pluto:2.10
                    If UserList(loopc).Name = "AoDraGBoT" Or UserList(loopc).Name = "AoDraGBoT2" Then GoTo nap

                    'pluto:2.5.0
                    sndData = CodificaR(str$(UserList(loopc).flags.ValCoDe), sndData, loopc, 1)
nap:
                    BytesEnviados = BytesEnviados + Len(sndData)
                    Call EnviarDatosASlot(loopc, sndData)
                    'frmMain.Socket2(LoopC).Write sndData, Len(sndData)
                    sndData = aa

                End If

            End If

        Next loopc

        Exit Sub

        'pluto:2-3-04
    Case ToGM

        For loopc = 1 To LastUser

            If UserList(loopc).ConnID > -1 And UserList(loopc).flags.UserLogged = True Then
                If UserList(loopc).flags.Privilegios > 2 Then

                    'pluto:2.10
                    If UserList(loopc).Name = "AoDraGBoT" Or UserList(loopc).Name = "AoDraGBoT2" Then GoTo nap1

                    'pluto:2.5.0
                    sndData = CodificaR(str$(UserList(loopc).flags.ValCoDe), sndData, loopc, 1)
nap1:
                    BytesEnviados = BytesEnviados + Len(sndData)
                    Call EnviarDatosASlot(loopc, sndData)
                    'frmMain.Socket2(LoopC).Write sndData, Len(sndData)
                    sndData = aa

                End If

            End If

        Next loopc

        Exit Sub
        'pluto:2.9.0

    Case ToTorneo

        For loopc = 1 To LastUser

            If (UserList(loopc).ConnID > -1) Then
                If UserList(loopc).flags.UserLogged Then
                    If UserList(loopc).flags.TorneoPluto > 0 Then

                        'pluto:2.10
                        If UserList(loopc).Name = "AoDraGBoT" Or UserList(loopc).Name = "AoDraGBoT2" Then GoTo nap2

                        'pluto:2.5.0
                        sndData = CodificaR(str$(UserList(loopc).flags.ValCoDe), sndData, loopc, 1)
nap2:
                        BytesEnviados = BytesEnviados + Len(sndData)
                        Call EnviarDatosASlot(loopc, sndData)
                        'frmMain.Socket2(LoopC).Write sndData, Len(sndData)
                        sndData = aa

                    End If

                End If

            End If

        Next loopc

        Exit Sub

        '[Tite]Msg a party
    Case toParty

        For loopc = 1 To LastUser

            If (UserList(loopc).ConnID > -1) Then
                If UserList(loopc).flags.UserLogged Then
                    If UserList(loopc).flags.party = True And UserList(loopc).flags.partyNum = UserList( _
                       sndIndex).flags.partyNum Then

                        If UserList(loopc).Name = "AoDraGBoT" Or UserList(loopc).Name = "AoDraGBoT2" Then GoTo nap10
                        sndData = CodificaR(str$(UserList(loopc).flags.ValCoDe), sndData, loopc, 1)
nap10:
                        BytesEnviados = BytesEnviados + Len(sndData)
                        Call EnviarDatosASlot(loopc, sndData)
                        'frmMain.Socket2(LoopC).Write sndData, Len(sndData)
                        sndData = aa

                    End If

                End If

            End If

        Next loopc

        Exit Sub

        '[\Tite]
    Case ToAll

        For loopc = 1 To LastUser

            If UserList(loopc).ConnID > -1 Then
                If UserList(loopc).flags.UserLogged Then    'Esta logeado como usuario?

                    'pluto:2.10
                    If UserList(loopc).Name = "AoDraGBoT" Or UserList(loopc).Name = "AoDraGBoT2" Then GoTo nap3

                    'pluto:2.5.0
                    sndData = CodificaR(str$(UserList(loopc).flags.ValCoDe), sndData, loopc, 1)
nap3:
                    BytesEnviados = BytesEnviados + Len(sndData)
                    Call EnviarDatosASlot(loopc, sndData)
                    'frmMain.Socket2(LoopC).Write sndData, Len(sndData)
                    sndData = aa

                End If

            End If

        Next loopc

        Exit Sub

    Case ToAllButIndex

        For loopc = 1 To LastUser

            If (UserList(loopc).ConnID > -1) And (loopc <> sndIndex) Then
                If UserList(loopc).flags.UserLogged Then    'Esta logeado como usuario?

                    'pluto:2.10
                    If UserList(loopc).Name = "AoDraGBoT" Or UserList(loopc).Name = "AoDraGBoT2" Then GoTo nap4

                    'pluto:2.5.0
                    sndData = CodificaR(str$(UserList(loopc).flags.ValCoDe), sndData, loopc, 1)
nap4:
                    BytesEnviados = BytesEnviados + Len(sndData)
                    Call EnviarDatosASlot(loopc, sndData)
                    'frmMain.Socket2(LoopC).Write sndData, Len(sndData)
                    sndData = aa

                End If

            End If

        Next loopc

        Exit Sub

    Case ToMap

        For loopc = 1 To LastUser

            If (UserList(loopc).ConnID > -1) Then
                If UserList(loopc).flags.UserLogged Then
                    If UserList(loopc).Pos.Map = sndMap Then

                        'pluto:2.10
                        If UserList(loopc).Name = "AoDraGBoT" Or UserList(loopc).Name = "AoDraGBoT2" Then GoTo nap5

                        'pluto:2.5.0
                        sndData = CodificaR(str$(UserList(loopc).flags.ValCoDe), sndData, loopc, 1)
nap5:
                        BytesEnviados = BytesEnviados + Len(sndData)
                        Call EnviarDatosASlot(loopc, sndData)
                        'frmMain.Socket2(LoopC).Write sndData, Len(sndData)
                        sndData = aa

                    End If

                End If

            End If

        Next loopc

        Exit Sub

    Case ToMapButIndex

        For loopc = 1 To LastUser

            If (UserList(loopc).ConnID > -1 And UserList(loopc).flags.UserLogged = True) And loopc <> sndIndex Then
                If UserList(loopc).Pos.Map = sndMap Then

                    'pluto:2.10
                    If UserList(loopc).Name = "AoDraGBoT" Or UserList(loopc).Name = "AoDraGBoT2" Then GoTo nap6

                    'pluto:2.5.0
                    sndData = CodificaR(str$(UserList(loopc).flags.ValCoDe), sndData, loopc, 1)
nap6:
                    BytesEnviados = BytesEnviados + Len(sndData)
                    Call EnviarDatosASlot(loopc, sndData)
                    'frmMain.Socket2(LoopC).Write sndData, Len(sndData)
                    sndData = aa

                End If

            End If

        Next loopc

        Exit Sub

    Case ToGuildMembers

        For loopc = 1 To LastUser

            If (UserList(loopc).ConnID > -1) And UserList(loopc).flags.UserLogged = True Then
                If UserList(sndIndex).GuildInfo.GuildName = UserList(loopc).GuildInfo.GuildName Then
                    ' If UserList(sndIndex).GuildInfo.GuildName = UserList(LoopC).GuildInfo.GuildName Then _
                      BytesEnviados = BytesEnviados + Len(sndData)

                    'pluto:2.10
                    If UserList(loopc).Name = "AoDraGBoT" Or UserList(loopc).Name = "AoDraGBoT2" Then GoTo nap7

                    'pluto:2.5.0
                    sndData = CodificaR(str$(UserList(loopc).flags.ValCoDe), sndData, loopc, 1)
nap7:
                    BytesEnviados = BytesEnviados + Len(sndData)
                    Call EnviarDatosASlot(loopc, sndData)
                    'frmMain.Socket2(LoopC).Write sndData, Len(sndData)
                    sndData = aa

                End If

            End If

        Next loopc

        Exit Sub

        'pluto:6.8-----torneo de clanes----------------------------
    Case ToClan

        For loopc = 1 To LastUser

            If (UserList(loopc).ConnID > -1) And UserList(loopc).flags.UserLogged = True Then
                If TorneoClan(1).Nombre = UserList(loopc).GuildInfo.GuildName Or TorneoClan(2).Nombre = UserList( _
                   loopc).GuildInfo.GuildName Then

                    sndData = "|," & sndData

                    If UserList(loopc).Name = "AoDraGBoT" Or UserList(loopc).Name = "AoDraGBoT2" Then GoTo nap17

                    sndData = CodificaR(str$(UserList(loopc).flags.ValCoDe), sndData, loopc, 1)
nap17:
                    BytesEnviados = BytesEnviados + Len(sndData)
                    Call EnviarDatosASlot(loopc, sndData)

                    sndData = aa

                End If

            End If

        Next loopc

        Exit Sub
        '--------------------------------------------

        'pluto:2.14--------------------------------

        'Case ToClan
        'For LoopC = 1 To LastUser
        'If (UserList(LoopC).ConnID > -1) And UserList(LoopC).flags.UserLogged = True Then

        'If (bb = "C1" Or bb = "C5") And UserList(LoopC).GuildInfo.GuildName <> castillo1 Then GoTo npp
        'If (bb = "C2" Or bb = "C6") And UserList(LoopC).GuildInfo.GuildName <> castillo2 Then GoTo npp
        'If (bb = "C3" Or bb = "C7") And UserList(LoopC).GuildInfo.GuildName <> castillo3 Then GoTo npp
        'If (bb = "C4" Or bb = "C8") And UserList(LoopC).GuildInfo.GuildName <> castillo4 Then GoTo npp

        ' If UserList(sndIndex).GuildInfo.GuildName = UserList(LoopC).GuildInfo.GuildName Then _
          BytesEnviados = BytesEnviados + Len(sndData)
        'pluto:2.10
        'If UserList(LoopC).name = "AoDraGBoT" Then GoTo nap17

        'pluto:2.5.0
        'sndData = CodificaR(str$(UserList(LoopC).flags.ValCoDe), sndData, 1)
        'nap17:
        ' BytesEnviados = BytesEnviados + Len(sndData)
        'Call EnviarDatosASlot(LoopC, sndData)
        ''frmMain.Socket2(LoopC).Write sndData, Len(sndData)
        'sndData = aa
        'End If
        'End If
        'npp:
        'Next LoopC
        'Exit Sub

        '------------------------------------------------

    Case ToPCArea

        For Y = UserList(sndIndex).Pos.Y - MinYBorder + 1 To UserList(sndIndex).Pos.Y + MinYBorder - 1
            For X = UserList(sndIndex).Pos.X - MinXBorder + 1 To UserList(sndIndex).Pos.X + MinXBorder - 1

                If InMapBounds(sndMap, X, Y) Then
                    If MapData(sndMap, X, Y).Userindex > 0 Then
                        If UserList(MapData(sndMap, X, Y).Userindex).ConnID > -1 And UserList(MapData(sndMap, X, _
                                                                                                      Y).Userindex).flags.UserLogged = True Then

                            'pluto:2.10
                            If UserList(MapData(sndMap, X, Y).Userindex).Name = "AoDraGBoT" Or UserList(MapData( _
                                                                                                        sndMap, X, Y).Userindex).Name = "AoDraGBoT2" Then GoTo nap8

                            'pluto:2.5.0
                            sndData = CodificaR(str$(UserList((MapData(sndMap, X, Y).Userindex)).flags.ValCoDe), _
                                                sndData, MapData(sndMap, X, Y).Userindex, 1)
nap8:
                            BytesEnviados = BytesEnviados + Len(sndData)
                            Call EnviarDatosASlot(MapData(sndMap, X, Y).Userindex, sndData)
                            'frmMain.Socket2(MapData(sndMap, X, Y).UserIndex).Write sndData, Len(sndData)
                            sndData = aa

                        End If

                    End If

                End If

            Next X
        Next Y

        Exit Sub

        'pluto:6.0A
    Case ToPUserAreaCercana

        For Y = UserList(sndIndex).Pos.Y - 2 To UserList(sndIndex).Pos.Y + 2
            For X = UserList(sndIndex).Pos.X - 2 To UserList(sndIndex).Pos.X + 2

                If InMapBounds(sndMap, X, Y) Then
                    If MapData(sndMap, X, Y).Userindex > 0 Then
                        If UserList(MapData(sndMap, X, Y).Userindex).ConnID > -1 And UserList(MapData(sndMap, X, _
                                                                                                      Y).Userindex).flags.UserLogged = True Then
                            'pluto:2.10
                            'If UserList(MapData(sndMap, X, Y).UserIndex).Name = "AoDraGBoT" Or UserList(MapData(sndMap, X, Y).UserIndex).Name = "AoDraGBoT2" Then GoTo nap8

                            'pluto:2.5.0
                            sndData = CodificaR(str$(UserList((MapData(sndMap, X, Y).Userindex)).flags.ValCoDe), _
                                                sndData, MapData(sndMap, X, Y).Userindex, 1) & ENDC
                            'nap8:
                            BytesEnviados = BytesEnviados + Len(sndData)
                            Call EnviarDatosASlot(MapData(sndMap, X, Y).Userindex, sndData)
                            'frmMain.Socket2(MapData(sndMap, X, Y).UserIndex).Write sndData, Len(sndData)
                            sndData = aa

                        End If

                    End If

                End If

            Next X
        Next Y

        Exit Sub
        
    Case ToCiudadanos
    
            For loopc = 1 To LastUser

            If UserList(loopc).ConnID > -1 Then
                If UserList(loopc).flags.UserLogged Then    'Esta logeado como usuario?

                    'pluto:2.10
                    If UserList(loopc).Name = "AoDraGBoT" Or UserList(loopc).Name = "AoDraGBoT2" Then GoTo nap11

                    'pluto:2.5.0
                    sndData = CodificaR(str$(UserList(loopc).flags.ValCoDe), sndData, loopc, 1)
nap11:
                    BytesEnviados = BytesEnviados + Len(sndData)
                    If UserList(loopc).Faccion.ArmadaReal = 1 Then Call EnviarDatosASlot(loopc, sndData)
                    'frmMain.Socket2(LoopC).Write sndData, Len(sndData)
                    sndData = aa

                End If

            End If

        Next loopc

        Exit Sub
    

        'For loopc = 1 To LastUser
         '   If UserList(loopc).Faccion.ArmadaReal = 1 Then Call EnviarDatosASlot(loopc, sndData)
        'Next
        'Exit Sub
        
        
     Case ToCriminales
     
                 For loopc = 1 To LastUser

            If UserList(loopc).ConnID > -1 Then
                If UserList(loopc).flags.UserLogged Then    'Esta logeado como usuario?

                    'pluto:2.10
                    If UserList(loopc).Name = "AoDraGBoT" Or UserList(loopc).Name = "AoDraGBoT2" Then GoTo nap12

                    'pluto:2.5.0
                    sndData = CodificaR(str$(UserList(loopc).flags.ValCoDe), sndData, loopc, 1)
nap12:
                    BytesEnviados = BytesEnviados + Len(sndData)
                    If UserList(loopc).Faccion.FuerzasCaos = 1 Then Call EnviarDatosASlot(loopc, sndData)
                    'frmMain.Socket2(LoopC).Write sndData, Len(sndData)
                    sndData = aa

                End If

            End If

        Next loopc

        Exit Sub
     
        'For loopc = 1 To LastUser
         '   If UserList(loopc).ConnID > -1 And UserList(loopc).Faccion.FuerzasCaos = 1 Then Call EnviarDatosASlot(loopc, sndData)
        'Next
        'Exit Sub

    Case ToNPCArea

        For Y = Npclist(sndIndex).Pos.Y - MinYBorder + 1 To Npclist(sndIndex).Pos.Y + MinYBorder - 1
            For X = Npclist(sndIndex).Pos.X - MinXBorder + 1 To Npclist(sndIndex).Pos.X + MinXBorder - 1

                If InMapBounds(sndMap, X, Y) Then
                    If MapData(sndMap, X, Y).Userindex > 0 Then
                        If UserList(MapData(sndMap, X, Y).Userindex).ConnID > -1 And UserList(MapData(sndMap, X, _
                                                                                                      Y).Userindex).flags.UserLogged = True Then

                            'pluto:2.10
                            If UserList(MapData(sndMap, X, Y).Userindex).Name = "AoDraGBoT" Or UserList(MapData( _
                                                                                                        sndMap, X, Y).Userindex).Name = "AoDraGBoT2" Then GoTo nap9

                            'pluto:2.5.0
                            sndData = CodificaR(str$(UserList(MapData(sndMap, X, Y).Userindex).flags.ValCoDe), _
                                                sndData, MapData(sndMap, X, Y).Userindex, 1) & ENDC
nap9:

                            BytesEnviados = BytesEnviados + Len(sndData)
                            Call EnviarDatosASlot(MapData(sndMap, X, Y).Userindex, sndData)
                            'frmMain.Socket2(MapData(sndMap, X, Y).UserIndex).Write sndData, Len(sndData)
                            sndData = aa

                        End If

                    End If

                End If

            Next X
        Next Y

        Exit Sub

    Case ToIndex

        If (sndIndex = 0) Or sndIndex > MaxUsers Then Exit Sub
        If UserList(sndIndex).ConnID > -1 Then
            'pluto.2.5.0

            If Asc(mid$(sndData, 2, 1)) = 18 Then
                GoTo nop

            End If

            'pluto:2.10
            If UserList(sndIndex).Name = "AoDraGBoT" Or UserList(sndIndex).Name = "AoDraGBoT2" Then GoTo nop

            sndData = CodificaR(str$(UserList(sndIndex).flags.ValCoDe), sndData, sndIndex, 1)
nop:
            '--------
            BytesEnviados = BytesEnviados + Len(sndData)
            Call EnviarDatosASlot(sndIndex, sndData)
            'frmMain.Socket2(sndIndex).Write sndData, Len(sndData)
            sndData = aa
            Exit Sub

        End If

    End Select

    Exit Sub
fallo:
    Call LogError("senddata " & Err.number & " D: " & Err.Description)

End Sub

Function EstaPCarea(index As Integer, Index2 As Integer) As Boolean

    On Error GoTo fallo

    Dim X As Integer, Y As Integer

    For Y = UserList(index).Pos.Y - MinYBorder + 1 To UserList(index).Pos.Y + MinYBorder - 1
        For X = UserList(index).Pos.X - MinXBorder + 1 To UserList(index).Pos.X + MinXBorder - 1

            If MapData(UserList(index).Pos.Map, X, Y).Userindex = Index2 Then
                EstaPCarea = True
                Exit Function

            End If

        Next X
    Next Y

    EstaPCarea = False

    Exit Function
fallo:
    Call LogError("estapcarea " & Err.number & " D: " & Err.Description)

End Function

Function HayPCarea(Pos As WorldPos) As Boolean

    On Error GoTo fallo

    'pluto:6.0A
    If Pos.Map = 139 Or Pos.Map = 48 Or Pos.Map = 110 Then
        HayPCarea = False
        Exit Function

    End If

    Dim X As Integer, Y As Integer

    For Y = Pos.Y - MinYBorder + 1 To Pos.Y + MinYBorder - 1
        For X = Pos.X - MinXBorder + 1 To Pos.X + MinXBorder - 1

            If X > 0 And Y > 0 And X < 101 And Y < 101 Then
                If MapData(Pos.Map, X, Y).Userindex > 0 Then
                    HayPCarea = True
                    Exit Function

                End If

            End If

        Next X
    Next Y

    HayPCarea = False

    Exit Function
fallo:
    Call LogError("haypcarea " & Err.number & " D: " & Err.Description)

End Function

Function HayAguaCerca(Pos As WorldPos) As Boolean

    On Error GoTo fallo

    Dim X As Integer, Y As Integer

    For Y = Pos.Y - 1 To Pos.Y + 1
        For X = Pos.X - 1 To Pos.X + 1

            If X > 0 And Y > 0 And X < 101 And Y < 101 Then

                If HayAgua(Pos.Map, X, Y) = True Then
                    HayAguaCerca = True
                    Exit Function

                End If

            End If

        Next X
    Next Y

    HayAguaCerca = False
    Exit Function
fallo:
    Call LogError("hayaguacerca " & Err.number & " D: " & Err.Description)

End Function

Function HayOBJarea(Pos As WorldPos, ObjIndex As Integer) As Boolean

    On Error GoTo fallo

    Dim X As Integer, Y As Integer

    For Y = Pos.Y - MinYBorder + 1 To Pos.Y + MinYBorder - 1
        For X = Pos.X - MinXBorder + 1 To Pos.X + MinXBorder - 1

            If MapData(Pos.Map, X, Y).OBJInfo.ObjIndex = ObjIndex Then
                HayOBJarea = True
                Exit Function

            End If

        Next X
    Next Y

    HayOBJarea = False
    Exit Function
fallo:
    Call LogError("hayobjarea " & Err.number & " D: " & Err.Description)

End Function

Sub CorregirSkills(ByVal Userindex As Integer)

    On Error GoTo fallo

    Dim k As Integer

    For k = 1 To NUMSKILLS

        If UserList(Userindex).Stats.UserSkills(k) > MAXSKILLPOINTS Then UserList(Userindex).Stats.UserSkills(k) = _
           MAXSKILLPOINTS
    Next

    For k = 1 To NUMATRIBUTOS

        If UserList(Userindex).Stats.UserAtributos(k) > MAXATRIBUTOS Then
            Call SendData2(ToIndex, Userindex, 0, 43, "El personaje tiene atributos invalidos.")
            Exit Sub

        End If

    Next k

    Exit Sub
fallo:
    Call LogError("corregirskills " & Err.number & " D: " & Err.Description)

End Sub

Function ValidateChr(ByVal Userindex As Integer) As Boolean

    On Error GoTo fallo

    'pluto:2.15
    'UserList(UserIndex).Bebe = 1
    If UserList(Userindex).Bebe > 0 Then ValidateChr = True: Exit Function

    ValidateChr = UserList(Userindex).Char.Head <> 0 And UserList(Userindex).Char.Body <> 0 And ValidateSkills( _
                  Userindex)
    Exit Function
fallo:
    Call LogError("validatechr " & Err.number & " D: " & Err.Description)

End Function

Sub ConnectUser(ByVal Userindex As Integer, Name As String, Password As String, Serie As String, Macplu As String)

    On Error GoTo fallo

    Dim n   As Integer
    Dim ooo As Byte
    'pluto:6.5
    'DoEvents
    'pluto:6.7

    'If Cuentas(UserIndex).mail <> UserList(UserIndex).EmailActual Then Exit Sub
    If Userindex < 1 Or Name = "" Then Exit Sub

    If FileExist(App.Path & "\Ban-IP\" & UserList(Userindex).ip & ".ips", vbArchive) Then
        'If BDDIsBanIP(UserList(UserIndex).ip) Then
        Call SendData2(ToIndex, Userindex, 0, 43, "La IP que usas está baneada en Aodrag.")
        Call CloseSocket(Userindex)
        Exit Sub

    End If

    'Reseteamos los FLAGS
    'pluto:5.2
    
    UserList(Userindex).flags.CMuerte = 1
    '---------
    UserList(Userindex).flags.Escondido = 0
    UserList(Userindex).flags.Guerra = False
    Call SendData(ToIndex, Userindex, 0, "|G0")
    UserList(Userindex).flags.Protec = 0
    UserList(Userindex).flags.Ron = 0
    UserList(Userindex).flags.TargetNpc = 0
    UserList(Userindex).flags.TargetNpcTipo = 0
    UserList(Userindex).flags.TargetObj = 0
    UserList(Userindex).flags.TargetUser = 0
    UserList(Userindex).Char.FX = 0
    'pluto:2.9.0
    UserList(Userindex).ObjetosTirados = 0
    UserList(Userindex).Alarma = 0
    UserList(Userindex).flags.Macreanda = 0
    UserList(Userindex).flags.ComproMacro = 0
    UserList(Userindex).Chetoso = 0
    UserList(Userindex).flags.ParejaTorneo = 0
    'pluto:2.10
    UserList(Userindex).GranPoder = 0
    UserList(Userindex).Char.FX = 0
    'pluto:2.19
    ooo = 1

    '¿Este IP ya esta conectado?
    If AllowMultiLogins = 0 Then

        If CheckForSameIP(Userindex, UserList(Userindex).ip) = True Then
            Call SendData2(ToIndex, Userindex, 0, 43, "No es posible usar mas de un personaje al mismo tiempo.")
            Call CloseSocket(Userindex)
            Exit Sub

        End If

    End If

    '¿Ya esta conectado el personaje?
    If CheckForSameName(Userindex, Name) Then
        Call SendData2(ToIndex, Userindex, 0, 43, "Perdon, un usuario con el mismo nombre se há logoeado.")
        Call CloseSocket(Userindex)
        Exit Sub

    End If

    '¿Existe el personaje?
    If Not PersonajeExiste(Name) Then
        Call SendData2(ToIndex, Userindex, 0, 43, "El personaje no existe..")
        Call CloseSocket(Userindex)
        Exit Sub

    End If

    ' ban ip

    'pluto:2.9.0
    'quitar esto
    If Not EsDios(Name) And Not EsSemiDios(Name) And SoloGm = True Then
        Call SendData2(ToIndex, Userindex, 0, 43, "El server en estos momentos está abierto sólo para Gms, estamos comprobando que todo funcione correctamente.")
        Call CloseSocket(Userindex)
        Exit Sub

    End If

    'pluto:2.19
    ooo = 2

    Dim Filex As String
    Filex = CharPath & Left$(UCase$(Name), 1) & "\" & UCase$(Name) & ".chr"

    If Not FileExist(CharPath & Left$(UCase$(Name), 1), vbDirectory) Then
        Call MkDir(CharPath & Left$(UCase$(Name), 1))

    End If

    If val(GetVar(Filex, "FLAGS", "BAN")) = 1 Then
        '    Call SendData2(ToIndex, UserIndex, 0, 43, "Este personaje esta baneado")
        '   Call CloseSocket(UserIndex)
        '    Exit Sub
        'End If
        'Delzak) ban
        'Call LoadUserInit(UserIndex, filex, Name)
        Dim rea  As String
        Dim rea2 As String
        Dim rea3 As String
        Dim rea4 As Boolean
        rea4 = False
        rea = GetVar(App.Path & "\logs\" & "BanDetail.dat", Name, "Reason")
        rea2 = GetVar(App.Path & "\logs\" & "BanDetail.dat", Name, "Fecha")

        'rea3 = Left$(Date, 2) - Day(Date)
        'If rea3 < 0 Then rea3 = rea3 * -1
        If UCase(Left$(rea, 6)) = "SEMANA" Then rea4 = True

        'If rea = "SEMANA" Then rea4 = True
        'rea3 = DateAdd("d", 7, rea2)
        If DateDiff("d", rea2, Date) < 7 Then rea4 = False

        'rea2 = DateDiff("d", rea2, Date)
        'If rea3 > 7 Then rea4 = False
        If rea4 = True Then
            'Call SendData2(ToIndex, UserIndex, 0, 43, "Este personaje fue baneado el dia " & rea2 & " debido a " & rea & ". El personaje ha sido desbaneado")
            Call SendData2(ToIndex, Userindex, 0, 107, Name & "fue baneado el dia " & rea2 & " debido a " & rea & ". El personaje ha sido desbaneado")
            Call UnBan(Name)
            Call CloseSocket(Userindex)
            'Call CloseUser(UserIndex) 'Lo echo
            Exit Sub
            '    Call LogGM(UserList(UserIndex).AoDragBot, "/UNBAN a " & rdata)
        Else
            Call SendData2(ToIndex, Userindex, 0, 107, Name & " está baneado debido a  " & rea & " desde el dia " & rea2 & "")
            Call CloseSocket(Userindex)
            Exit Sub

        End If

    End If    ' fin baneado

    'Cargamos los datos del personaje
    Call LoadUserInit(Userindex, Filex, Name)

    '[Tite]Party
    Call sendMiembrosParty(Userindex)
    '[\Tite]
    'Call LoadUserStats(UserIndex, filex)

    'pluto:2.3
    'Call LoadUserMontura(UserIndex, filex)
    'Call CorregirSkills(UserIndex)

    'pluto:2.19
    ooo = 3
    'If UCase$(UserList(UserIndex).raza) = "ORCO" Then UserList(UserIndex).UserDañoArmasRaza = 20

    'If UCase$(UserList(UserIndex).raza) = "HUMANO" Then
    'UserList(UserIndex).UserDañoArmasRaza = 10
    'UserList(UserIndex).UserDefensaMagiasRaza = 5
    'End If
    'pluto:6.0A camio enano +8 y +8
    'If UCase$(UserList(UserIndex).raza) = "ENANO" Then
    'UserList(UserIndex).UserDañoArmasRaza = 8
    'UserList(UserIndex).UserDefensaMagiasRaza = 8
    'UserList(UserIndex).UserEvasiónRaza = 10
    'End If

    'If UCase$(UserList(UserIndex).raza) = "GNOMO" Then
    'UserList(UserIndex).UserDefensaMagiasRaza = 15
    'UserList(UserIndex).UserEvasiónRaza = 10
    'End If

    'If UCase$(UserList(UserIndex).raza) = "VAMPIRO" Then
    'UserList(UserIndex).UserEvasiónRaza = 10
    'End If

    'If UCase$(UserList(Userindex).raza) = "ELFO OSCURO" Then
        'pluto:6.0A cambiamos a 10 el 15
        'pluto:7.0 bonus invisibilidad elfo oscuro
        'UserList(UserIndex).UserDañoProyetilesRaza = 10
        'UserList(UserIndex).UserDefensaMagiasRaza = 5
        'UserList(Userindex).BonusElfoOscuro = Porcentaje(IntervaloInvisible, 33)

    'End If

    'If UCase$(UserList(UserIndex).raza) = "ELFO" Then
    'UserList(UserIndex).UserDañoMagiasRaza = 8
    'UserList(UserIndex).UserDefensaMagiasRaza = 10
    'End If
    '----------------------------------------------------------

    If Not ValidateChr(Userindex) Then
        Call SendData2(ToIndex, Userindex, 0, 43, "Error en el personaje.")
        Call CloseSocket(Userindex)
        Exit Sub

    End If

    'pluto:2.19
    ooo = 4
    'Call LoadUserReputacion(UserIndex, filex)
    'pluto:2.14
    UserList(Userindex).Serie = Serie

    'pluto:6.7
    If UserList(Userindex).MacPluto2 <> Macplu Then

        'protec
        'a:
        'GoTo a
    End If

    If UserList(Userindex).Invent.EscudoEqpSlot = 0 Then UserList(Userindex).Char.ShieldAnim = NingunEscudo

    If UserList(Userindex).Invent.CascoEqpSlot = 0 Then UserList(Userindex).Char.CascoAnim = NingunCasco

    If UserList(Userindex).Invent.WeaponEqpSlot = 0 Then UserList(Userindex).Char.WeaponAnim = NingunArma

    '[GAU]
    If UserList(Userindex).Invent.BotaEqpSlot = 0 Then UserList(Userindex).Char.Botas = NingunBota

    If UserList(Userindex).Invent.AlaEqpSlot = 0 Then UserList(Userindex).Char.AlasAnim = NingunAla
    '[GAU]

    'pluto:2.3 calcula peso
    Dim X, X1 As Integer
    UserList(Userindex).Stats.Peso = 0
    UserList(Userindex).Stats.PesoMax = 0

    For n = 1 To MAX_INVENTORY_SLOTS
        X = UserList(Userindex).Invent.Object(n).ObjIndex
        X1 = UserList(Userindex).Invent.Object(n).Amount

        If X > 0 Then
            UserList(Userindex).Stats.Peso = UserList(Userindex).Stats.Peso + (ObjData(X).Peso * X1)

        End If

    Next n

    UserList(Userindex).Stats.PesoMax = (UserList(Userindex).Stats.UserAtributos(1) * 5) + (UserList(Userindex).Stats.ELV * 3)

    'pluto:4.2.1
    If UserList(Userindex).flags.Montura = 1 Then
        UserList(Userindex).Stats.PesoMax = UserList(Userindex).Stats.PesoMax + (UserList(Userindex).flags.ClaseMontura * 100)

    End If

    If UserList(Userindex).Invent.AnilloEqpObjIndex = 989 Then
        UserList(Userindex).Stats.PesoMax = UserList(Userindex).Stats.PesoMax + 500

    End If

    'pluto:6.0A------------
    If UserList(Userindex).flags.Navegando = 1 Then

        If UserList(Userindex).Invent.BarcoObjIndex = 474 Then
            UserList(Userindex).Stats.PesoMax = UserList(Userindex).Stats.PesoMax + 100
        ElseIf UserList(Userindex).Invent.BarcoObjIndex = 475 Then
            UserList(Userindex).Stats.PesoMax = UserList(Userindex).Stats.PesoMax + 300
        ElseIf UserList(Userindex).Invent.BarcoObjIndex = 476 Then
            UserList(Userindex).Stats.PesoMax = UserList(Userindex).Stats.PesoMax + 500

        End If

    End If    'navegando

    '-----------------------
    'pluto:2.9.0
    Call SendUserClase(Userindex)

    'quitar esto
    'EventoDia = 3
    'pluto:6.8-----------
    Select Case EventoDia

        Case 1
            Call SendData2(ToIndex, Userindex, 0, 99, NombreBichoDelDia)

        Case 2
            Call SendData2(ToIndex, Userindex, 0, 101)

        Case 3
            Call SendData2(ToIndex, Userindex, 0, 102)

        Case 4
            Call SendData2(ToIndex, Userindex, 0, 103, NombreBichoDelDia)

        Case 5
            Call SendData2(ToIndex, Userindex, 0, 104)

    End Select

    '------------------
    'eze conexion usuarios
    Call SendData(ToIndex, Userindex, 0, "I3" & TiempoMomia)
    Call SendData(ToIndex, Userindex, 0, "I4" & TiempoCaballero)
    Call SendData(ToIndex, Userindex, 0, "I5" & TiempoOscuro)
    Call SendData(ToIndex, Userindex, 0, "I6" & BloodComienza)
    Call SendData(ToIndex, Userindex, 0, "J8")
    Call SendData(ToIndex, Userindex, 0, "I7" & TiempoRegalo)
    
    TimeGuerraX = TiempoEntreGuerra - TiempoGuerra
    
    If TimeGuerraX > 0 Then
        Call SendData(ToIndex, Userindex, 0, "J9" & TimeGuerraX)
    Else
        Call SendData(ToIndex, Userindex, 0, "J9" & 0)

    End If
    
    If TiempoHunger > 5 Then
        Call SendData(ToIndex, Userindex, 0, "J7" & TiempoHunger - 5)
    Else
        Call SendData(ToIndex, Userindex, 0, "J7" & 0)

    End If
    
    Dim PuntosD As Integer
    PuntosD = UserList(Userindex).flags.Creditos
    Call SendData(ToIndex, Userindex, 0, "J6" & PuntosD)

    Dim PuntosC As Integer
    PuntosC = UserList(Userindex).Stats.Puntos
    Call SendData(ToIndex, Userindex, 0, "J5" & PuntosC)
      
    'eze conexion usuarios
      
    Call UpdateUserInv(True, Userindex, 0)
    Call UpdateUserHechizos(True, Userindex, 0)
    'pluto:2.19
    ooo = 5

    If UserList(Userindex).flags.Navegando = 1 Then

        'pluto:6.0A---------
        If UserList(Userindex).flags.Muerto = 0 Then
            UserList(Userindex).Char.Body = ObjData(UserList(Userindex).Invent.BarcoObjIndex).Ropaje
        Else
            UserList(Userindex).Char.Body = 87

        End If

        '-------------------
        UserList(Userindex).Char.Head = 0
        UserList(Userindex).Char.WeaponAnim = 0
        UserList(Userindex).Char.ShieldAnim = 0
        UserList(Userindex).Char.CascoAnim = 0
        '[GAU]
        UserList(Userindex).Char.Botas = 0
        UserList(Userindex).Char.AlasAnim = 0

        '[GAU]
    End If

    UserList(Userindex).flags.Morph = 0
    UserList(Userindex).flags.Angel = 0
    UserList(Userindex).flags.Demonio = 0

    'pluto:2.9.0
    If UserList(Userindex).flags.Paralizado Then
        Call SendData2(ToIndex, Userindex, 0, 68)
        UserList(Userindex).Counters.Paralisis = IntervaloParalisisPJ

    End If

    'Posicion de comienzo

    'saca de mapa de torneo
    'Dim x As Integer
    Dim Y   As Integer
    Dim Map As Integer
    'pluto:2.9.0 añade el 192 futbol
    'pluto:2.12 añade torneo2
    'If UserList(UserIndex).Pos.Map = MAPATORNEO Or UserList(UserIndex).Pos.Map = MapaTorneo2 Or UserList(UserIndex).Pos.Map = 192 Or UserList(UserIndex).Pos.Map = 191 Then
    'If Not Criminal(UserIndex) Then UserList(UserIndex).Pos = Banderbill Else UserList(UserIndex).Pos = ciudadcaos
    'End If
    'pluto:6.0A fabrica lingotes
    'If UserList(UserIndex).Pos.Map = 277 And UserList(UserIndex).Pos.x = 36 And UserList(UserIndex).Pos.Y = 70 Then
    ' UserList(UserIndex).Pos = Nix
    'End If

    'pluto:2.18
    'If (UserList(UserIndex).Pos.Map = 186 And fortaleza <> UserList(UserIndex).GuildInfo.GuildName) Then
    'If Not Criminal(UserIndex) Then UserList(UserIndex).Pos = Banderbill Else UserList(UserIndex).Pos = ciudadcaos
    'End If
    'pluto:6.0A
    'If UserList(UserIndex).Pos.Map = 166 Or UserList(UserIndex).Pos.Map = 167 Or UserList(UserIndex).Pos.Map = 168 Or UserList(UserIndex).Pos.Map = 169 Then
    '    UserList(UserIndex).Pos.Map = UserList(UserIndex).Pos.Map
    '    UserList(UserIndex).Pos.x = 26 + RandomNumber(1, 9)
    '    UserList(UserIndex).Pos.Y = 85 + RandomNumber(1, 5)
    'End If

    'pluto:2.15
    'Dim a As Integer
    'Dim b As Byte
    '
    'If Criminal(UserIndex) Then b = 2 Else b = 1

    'a = ReadField(1, GetVar(filex, "INIT", "Position"), 45)
    'If a = 0 Then GoTo ff:
    'If MapInfo(a).Dueño = 2 And b = 1 And UserList(UserIndex).flags.Muerto = 0 Then
    'Call SendData2(ToIndex, UserIndex, 0, 43, "La ciudad en la que te encontrabas ha sido conquistada por las Fuerzas Imperiales y has tenido que huir a una ciudad segura.")
    'Call SendData(ToIndex, UserIndex, 0, "||La ciudad en la que te encontrabas ha sido conquistada por las Fuerzas Imperiales y has tenido que huir a una ciudad segura." & FONTTYPENAMES.FONTTYPE_COMERCIO)
    'UserList(UserIndex).Pos = Banderbill

    'End If

    'pluto:2.19
    ooo = 6
    'If MapInfo(a).Dueño = 1 And b = 2 And UserList(UserIndex).flags.Muerto = 0 Then
    'Call SendData2(ToIndex, UserIndex, 0, 43, "La ciudad en la que te encontrabas ha sido conquistada por las Fuerzas Del Caos y has tenido que huir a una ciudad segura.")
    'Call SendData(ToIndex, UserIndex, 0, "||La ciudad en la que te encontrabas ha sido conquistada por las Fuerzas Del Caos y has tenido que huir a una ciudad segura." & FONTTYPENAMES.FONTTYPE_COMERCIO)

    'UserList(UserIndex).Pos = ciudadcaos

    'End If

    'ff:

    'pluto:6.5 -----------------------------------------------------------------
    Select Case UserList(Userindex).Pos.Map

        Case mapatorneo    'torneos
            'If Not Criminal(UserIndex) Then UserList(UserIndex).Pos = Banderbill Else UserList(UserIndex).Pos = ciudadcaos
            UserList(Userindex).Pos.Map = 34
            UserList(Userindex).Pos.X = 35
            UserList(Userindex).Pos.Y = 35

        Case MapaTorneo2    'torneos
            'If Not Criminal(UserIndex) Then UserList(UserIndex).Pos = Banderbill Else UserList(UserIndex).Pos = ciudadcaos
            UserList(Userindex).Pos.Map = 34
            UserList(Userindex).Pos.X = 35
            UserList(Userindex).Pos.Y = 35

        Case 303    'torneos gms
            UserList(Userindex).Pos.Map = 34
            UserList(Userindex).Pos.X = 35
            UserList(Userindex).Pos.Y = 35

        Case 291 To 295    'torneos
            'If Not Criminal(UserIndex) Then UserList(UserIndex).Pos = Banderbill Else UserList(UserIndex).Pos = ciudadcaos
            UserList(Userindex).Pos.Map = 34
            UserList(Userindex).Pos.X = 35
            UserList(Userindex).Pos.Y = 35

        Case 277    'fabrica lingotes

            If UserList(Userindex).Pos.X = 36 And UserList(Userindex).Pos.Y = 70 Then UserList(Userindex).Pos = Nix

        Case 185 To 186    'fortaleza

            If fortaleza <> UserList(Userindex).GuildInfo.GuildName Then

                If Not Criminal(Userindex) Then UserList(Userindex).Pos = Banderbill Else UserList(Userindex).Pos = ciudadcaos

            End If

        Case 166    'castillos
            UserList(Userindex).Pos.X = 31 + RandomNumber(1, 9)
            UserList(Userindex).Pos.Y = 78 + RandomNumber(1, 5)
        
        Case 167    'castillos
            UserList(Userindex).Pos.X = 25 + RandomNumber(1, 9)
            UserList(Userindex).Pos.Y = 76 + RandomNumber(1, 5)
        
        Case 168   'castillos
            UserList(Userindex).Pos.X = 25 + RandomNumber(1, 9)
            UserList(Userindex).Pos.Y = 76 + RandomNumber(1, 5)
        
        Case 169   'castillos
            UserList(Userindex).Pos.X = 26 + RandomNumber(1, 9)
            UserList(Userindex).Pos.Y = 76 + RandomNumber(1, 5)

        Case 191 To 192    'dragfutbol
            UserList(Userindex).Pos = Nix
        
        Case 203 To 210    'dragfutbol
            UserList(Userindex).Pos.Map = 34
            UserList(Userindex).Pos.X = 26 + RandomNumber(1, 9)
            UserList(Userindex).Pos.Y = 84 + RandomNumber(1, 5)

            'IRON AO: Desconexion en nix
        Case 34    'Nix
            UserList(Userindex).Pos.X = 26 + RandomNumber(1, 9)
            UserList(Userindex).Pos.Y = 84 + RandomNumber(1, 5)

    End Select

    '------------------------------------------------------------------------

    'pluto:6.0A-------
    If FileExist(App.Path & "\Bloqueos\" & UserList(Userindex).Serie & ".lol", vbArchive) Then
        'Call WarpUserChar(UserIndex, 191, 50, 50, True)
        UserList(Userindex).Pos.Map = 191
        UserList(Userindex).Pos.X = 50
        UserList(Userindex).Pos.Y = 50
        Call SendData(ToIndex, Userindex, 0, "I2")
        'Call SendData(ToIndex, UserIndex, 0, "|| Está Pc ha sido bloqueada para jugar Aodrag, aparecerás en este Mapa cada vez que juegues, avisa Gm para desbloquear la Pc y portate bién o atente a las consecuencias." & FONTTYPENAMES.FONTTYPE_TALK)
        'pluto:2.11
        Call SendData(ToAdmins, Userindex, 0, "|| Ha entrado en Mapa 191: " & Name & "´" & FontTypeNames.FONTTYPE_talk)
        Call LogMapa191("Jugador:" & Name & " entró al Mapa 191 " & "Ip: " & UserList(Userindex).ip)

    End If

    '-------------------
    'pluto:6.0A-------
    If FileExist(App.Path & "\MacPluto\" & UserList(Userindex).MacPluto & ".lol", vbArchive) Then
        Call SendData(ToIndex, Userindex, 0, "W7")
        Call SendData(ToAdmins, Userindex, 0, "|| Cliente Colgado: " & Name & "´" & FontTypeNames.FONTTYPE_talk)
        'Call LogMapa191("Jugador:" & Name & " entró al Mapa 191 " & "Ip: " & UserList(UserIndex).ip)
        Call CloseSocket(Userindex)
        Exit Sub

    End If

    '-------------------

    If UserList(Userindex).Pos.Map = 0 Then
        'pluto:6.0A

        If UserList(Userindex).clase = "Mago" Or UserList(Userindex).clase = "Druida" Then
            Call SendData(ToIndex, Userindex, 0, "AWmagico1")
        Else
            Call SendData(ToIndex, Userindex, 0, "AWcurro1")

        End If

        'pluto:2.17---------------
        If UCase$(UserList(Userindex).Hogar) = "ALDEA DE HUMANOS" Then

            UserList(Userindex).Pos.Map = 37
            UserList(Userindex).Pos.X = 74 + RandomNumber(1, 9)
            UserList(Userindex).Pos.Y = 85 + RandomNumber(1, 4)

        ElseIf UCase$(UserList(Userindex).Hogar) = "POBLADO ORCO" Then
            UserList(Userindex).Pos.Map = 37
            UserList(Userindex).Pos.X = 74 + RandomNumber(1, 9)
            UserList(Userindex).Pos.Y = 85 + RandomNumber(1, 4)
        ElseIf UCase$(UserList(Userindex).Hogar) = "POBLADO ENANO" Then
            UserList(Userindex).Pos.Map = 37
            UserList(Userindex).Pos.X = 74 + RandomNumber(1, 9)
            UserList(Userindex).Pos.Y = 85 + RandomNumber(1, 4)
        ElseIf UCase$(UserList(Userindex).Hogar) = "ALDEA DE GNOMOS" Then
            UserList(Userindex).Pos.Map = 37
            UserList(Userindex).Pos.X = 74 + RandomNumber(1, 9)
            UserList(Userindex).Pos.Y = 85 + RandomNumber(1, 4)
        ElseIf UCase$(UserList(Userindex).Hogar) = "ALDEA ÉLFICA" Then
            UserList(Userindex).Pos.Map = 37
            UserList(Userindex).Pos.X = 74 + RandomNumber(1, 9)
            UserList(Userindex).Pos.Y = 85 + RandomNumber(1, 4)
        Else
            UserList(Userindex).Hogar = "ALDEA DE VAMPIROS"
            UserList(Userindex).Pos.Map = 37
            UserList(Userindex).Pos.X = 74 + RandomNumber(1, 9)
            UserList(Userindex).Pos.Y = 85 + RandomNumber(1, 4)

        End If

        '-------------------------------------
    Else

        'pluto:6.5
        If MapData(UserList(Userindex).Pos.Map, UserList(Userindex).Pos.X, UserList(Userindex).Pos.Y).Userindex <> 0 Then
            'GetObj (MapData(UserList(UserIndex).Pos.Map, UserList(UserIndex).Pos.X, UserList(UserIndex).Pos.Y).UserIndex)
            Call CloseUser(MapData(UserList(Userindex).Pos.Map, UserList(Userindex).Pos.X, UserList(Userindex).Pos.Y).Userindex)

        End If

    End If

    'Nombre de sistema
    UserList(Userindex).Name = Name
    'UserList(UserIndex).ip = frmMain.Socket2(UserIndex).PeerAddress

    'Info
    Call SendData(ToIndex, Userindex, 0, "IU" & Userindex)    'Enviamos el User index
    Call SendData2(ToIndex, Userindex, 0, 14, UserList(Userindex).Pos.Map & "," & MapInfo(UserList(Userindex).Pos.Map).MapVersion)    'Carga el mapa
    Call SendData(ToIndex, Userindex, 0, "TM" & MapInfo(UserList(Userindex).Pos.Map).Music)

    If Lloviendo Then Call SendData2(ToIndex, Userindex, 0, 20, "1")

    'pluto:2.15
    Call SendUserMuertos(Userindex)
    'pluto:6.0A
    Call SendUserStatsFama(Userindex)
    'envia dueño mapas
    'Dim n As Integer
    Dim ci As String

    '[Tite]Nix neutral
    ci = str(MapInfo(1).Dueño) & "," & str(MapInfo(20).Dueño) & "," & str(MapInfo(63).Dueño) & "," & str(MapInfo(81).Dueño) & "," & str(MapInfo(84).Dueño) & "," & str(MapInfo(112).Dueño) & "," & str(MapInfo(151).Dueño) & "," & str(MapInfo(157).Dueño) & "," & str(MapInfo(184).Dueño)
    'ci = str(MapInfo(1).Dueño) & "," & str(MapInfo(20).Dueño) & "," & str(MapInfo(34).Dueño) & "," & str(MapInfo(63).Dueño) & "," & str(MapInfo(81).Dueño) & "," & str(MapInfo(84).Dueño) & "," & str(MapInfo(112).Dueño) & "," & str(MapInfo(151).Dueño) & "," & str(MapInfo(157).Dueño) & "," & str(MapInfo(184).Dueño)
    '[\Tite]

    Call SendData(ToIndex, Userindex, 0, "K4" & ci)
    '------------------------------------------------------

    If AtaNorte = 1 Then Call SendData(ToIndex, Userindex, 0, "C1")

    If AtaSur = 1 Then Call SendData(ToIndex, Userindex, 0, "C2")

    If AtaEste = 1 Then Call SendData(ToIndex, Userindex, 0, "C3")

    If AtaOeste = 1 Then Call SendData(ToIndex, Userindex, 0, "C4")

    If AtaForta = 1 Then Call SendData(ToIndex, Userindex, 0, "V8")
    'pluto:2.19
    ooo = 7
    Call UpdateUserMap(Userindex)
    Call senduserstatsbox(Userindex)
    Call SendUserRazaClase(Userindex)
    'Call SendUserPremios(UserIndex) 'Delzak premios
    'pluto:2.3
    Call SendUserStatsPeso(Userindex)

    Call EnviarHambreYsed(Userindex)

    Call SendMOTD(Userindex)

    If haciendoBK Or haciendoBKPJ Then
        Call SendData2(ToIndex, Userindex, 0, 19)
        Call SendData(ToIndex, Userindex, 0, "||Por favor espera algunos segundo, WorldSave esta ejecutandose." & "´" & FontTypeNames.FONTTYPE_INFO)

    End If

    'Actualiza el Num de usuarios
    If Userindex > LastUser Then LastUser = Userindex

    NumUsers = NumUsers + 1

    'pluto.2.8.0
    If NumUsers >= ReNumUsers Then
        ReNumUsers = NumUsers
        HoraHoy = Time

    End If

    'pluto:2.4
    'If Not Criminal(UserIndex) Then UserCiu = UserCiu + 1 Else UserCrimi = UserCrimi + 1

    'Call SendData2(ToAll, UserIndex, 0, 17, CStr(NumUsers))
    'Call SendData2(ToIndex, UserIndex, 0, 17, CStr(NumUsers))
    'pluto:6.8
    
    Dim k As Long, Added As Boolean
    If UserList(Userindex).flags.Privilegios = 0 Then
        MapInfo(UserList(Userindex).Pos.Map).NumUsers = MapInfo(UserList(Userindex).Pos.Map).NumUsers + 1
        Added = True

        ' Chequemoas que en el mapa ya no este el index.
        For k = 1 To MapInfo(UserList(Userindex).Pos.Map).Userindex.Count
            If MapInfo(UserList(Userindex).Pos.Map).Userindex.Item(k) = Userindex Then
                Added = False
                Exit For
            End If
        Next k

        If Added Then
            MapInfo(UserList(Userindex).Pos.Map).Userindex.Add Userindex
        End If
        
    End If
    
    'If UserList(UserIndex).Stats.SkillPts > 0 Then
    Call EnviarSkills(Userindex)
    'Call EnviarSubirNivel(UserIndex, UserList(UserIndex).Stats.SkillPts)
    'End If

    'If NumUsers > DayStats.Maxusuarios Then DayStats.Maxusuarios = NumUsers

    If NumUsers > recordusuarios Then
        Call SendData(ToAll, 0, 0, "||Record de usuarios conectados simultaneamente." & "Hay " & Round(NumUsers) & " usuarios." & "´" & FontTypeNames.FONTTYPE_INFO)
        recordusuarios = NumUsers
        Call WriteVar(IniPath & "Server.ini", "INIT", "Record", str(recordusuarios))

    End If

    'pluto:2.11 añade UserList(UserIndex).Faccion.ArmadaReal = 2
    If (UserList(Userindex).Faccion.RecompensasCaos > 9 And UserList(Userindex).Faccion.CiudadanosMatados < 800) Or (UserList(Userindex).Faccion.RecompensasReal > 10 And UserList(Userindex).Faccion.CriminalesMatados < 800 And UserList(Userindex).Faccion.ArmadaReal = 1) Then

        If UserList(Userindex).flags.Privilegios = 0 Then Call LogCasino("Jugador:" & UserList(Userindex).Name & " mirar recompensas armadas " & "Ip: " & UserList(Userindex).ip)

    End If

    If EsDios(Name) Then
        UserList(Userindex).flags.Privilegios = 3
        Call LogGM(UserList(Userindex).Name, "Se conecto con ip:" & UserList(Userindex).ip & " SE: " & UserList(Userindex).Serie)

    ElseIf EsSemiDios(Name) Then
        UserList(Userindex).flags.Privilegios = 2
        Call LogGM(UserList(Userindex).Name, "Se conecto con ip:" & UserList(Userindex).ip & " SE: " & UserList(Userindex).Serie)
    ElseIf EsConsejero(Name) Then
        UserList(Userindex).flags.Privilegios = 1
        Call LogGM(UserList(Userindex).Name, "Se conecto con ip:" & UserList(Userindex).ip & " SE: " & UserList(Userindex).Serie)
    Else
        UserList(Userindex).flags.Privilegios = 0

    End If
    
    If UserList(Userindex).flags.Privilegios > 0 Then
        Call SendData(ToIndex, Userindex, 0, "I8")

    End If

    'pluto:2.19
    ooo = 8
    'If UserList(UserIndex).Flags.Privilegios > 0 Then Call BDDSetGMState(UCase$(name), 1)
    Set UserList(Userindex).GuildRef = FetchGuild(UserList(Userindex).GuildInfo.GuildName)

    UserList(Userindex).Counters.IdleCount = 0

    If UserList(Userindex).NroMacotas > 0 Then
        Dim i As Integer

        For i = 1 To MAXMASCOTAS

            If UserList(Userindex).MascotasType(i) > 0 Then
                UserList(Userindex).MascotasIndex(i) = SpawnNpc(UserList(Userindex).MascotasType(i), UserList(Userindex).Pos, True, True)

                If UserList(Userindex).MascotasIndex(i) <= MAXNPCS Then
                    Npclist(UserList(Userindex).MascotasIndex(i)).MaestroUser = Userindex
                    Call FollowAmo(UserList(Userindex).MascotasIndex(i))
                Else
                    UserList(Userindex).MascotasIndex(i) = 0

                End If

            End If

        Next i

    End If

    If UserList(Userindex).flags.Navegando = 1 Then Call SendData2(ToIndex, Userindex, 0, 6)

    UserList(Userindex).flags.Seguro = True
    '[Tite]Seguro de ataques criticos
    UserList(Userindex).flags.SegCritico = False
    '[/Tite]
    UserList(Userindex).flags.UserLogged = True
    'Crea  el personaje del usuario
    Call MakeUserChar(ToMap, 0, UserList(Userindex).Pos.Map, Userindex, UserList(Userindex).Pos.Map, UserList(Userindex).Pos.X, UserList(Userindex).Pos.Y)
    Call SendData(ToIndex, Userindex, 0, "IP" & UserList(Userindex).Char.CharIndex)
    Call SendData2(ToPCArea, Userindex, UserList(Userindex).Pos.Map, 22, UserList(Userindex).Char.CharIndex & "," & FXWARP & "," & 0)
    Call SendData2(ToIndex, Userindex, 0, 4)

    Call SendGuildNews(Userindex)
    Call MostrarNumUsers
    'Call BDDSetUsersOnline

    'pluto:2.14
    Call ComprobarLista(UserList(Userindex).Name)
    '-----------------------
    'n = FreeFile
    'Open App.Path & "\logs\numusers.log" For Output As n
    'Print #n, NumUsers
    'Close #n

    'n = FreeFile
    'Log
    'Open App.Path & "\logs\Connect.log" For Append Shared As #n
    'Print #n, UserList(UserIndex).Name & " ha entrado al juego. UserIndex:" & UserIndex & " " & Time & " " & Date
    'Close #n

    'pluto:2.9.0
    UserList(Userindex).ObjetosTirados = 0
    UserList(Userindex).Alarma = 0
    'pluto:2.10
    UserList(Userindex).GranPoder = 0

    'pluto:2.5.0
    If UserList(Userindex).GuildInfo.GuildName = "" Then UserList(Userindex).GuildInfo.GuildPoints = 0

    'pluto:2.9.0
    If MsgEntra <> "" Then Call SendData2(ToIndex, Userindex, 0, 43, MsgEntra)
    Call SendData2(ToAll, 0, 0, 117, "B" & DobleExp)
    'pluto:2.19
    ooo = 9
    'pluto:2.17
    'If a = 0 Then GoTo fff
    'If MapInfo(a).Dueño = 2 And b = 1 And UserList(UserIndex).flags.Muerto = 0 Then Call SendData(ToIndex, UserIndex, 0, "||La ciudad en la que te encontrabas ha sido conquistada por las Fuerzas del Caos y has tenido que huir a una Ciudad Segura." & FONTTYPENAMES.FONTTYPE_COMERCIO)
    'If MapInfo(a).Dueño = 1 And b = 2 And UserList(UserIndex).flags.Muerto = 0 Then Call SendData(ToIndex, UserIndex, 0, "||La ciudad en la que te encontrabas ha sido conquistada por las Fuerzas del Imperio Real y has tenido que huir a una Ciudad Segura." & FONTTYPENAMES.FONTTYPE_COMERCIO)

fff:

    Exit Sub
fallo:
    Call LogError("connectuser->Nombre: " & Name & " Ip: " & UserList(Userindex).ip & " seña: " & ooo & " " & Err.Description)

End Sub

Sub SendMOTD(ByVal Userindex As Integer)

    On Error GoTo fallo

    'Dim j As Integer
    'Call SendData(ToIndex, UserIndex, 0, "||Npc Del Día: " & NombreBichoDelDia & "´" & FontTypeNames.FONTTYPE_talk)

    'For j = 1 To MaxLines
    '   Call SendData(ToIndex, UserIndex, 0, "||" & MOTD(j) & "´" & FontTypeNames.FONTTYPE_INFO)
    'Next j
    'Call SendData(ToIndex, UserIndex, 0, "||Castillo Norte: " & castillo1 & " Fecha: " & date1 & " Hora: " & hora1 & "´" & FontTypeNames.FONTTYPE_INFO)
    'Call SendData(ToIndex, UserIndex, 0, "||Castillo Sur: " & castillo2 & " Fecha: " & date2 & " Hora: " & hora2 & "´" & FontTypeNames.FONTTYPE_INFO)
    'Call SendData(ToIndex, UserIndex, 0, "||Castillo Este: " & castillo3 & " Fecha: " & date3 & " Hora: " & hora3 & "´" & FontTypeNames.FONTTYPE_INFO)
    'Call SendData(ToIndex, UserIndex, 0, "||Castillo Oeste: " & castillo4 & " Fecha: " & date4 & " Hora: " & hora4 & "´" & FontTypeNames.FONTTYPE_INFO)
    'Call SendData(ToIndex, UserIndex, 0, "||Fortaleza: " & fortaleza & " Fecha: " & date5 & " Hora: " & hora5 & "´" & FontTypeNames.FONTTYPE_INFO)
    Exit Sub
fallo:
    Call LogError("sendmotd " & Err.number & " D: " & Err.Description)

End Sub

Sub ResetFacciones(ByVal Userindex As Integer)

    On Error GoTo fallo

    UserList(Userindex).Faccion.ArmadaReal = 0
    UserList(Userindex).Faccion.FuerzasCaos = 0
    UserList(Userindex).Faccion.CiudadanosMatados = 0
    UserList(Userindex).Faccion.CriminalesMatados = 0
    UserList(Userindex).Faccion.RecibioArmaduraCaos = 0
    UserList(Userindex).Faccion.RecibioArmaduraReal = 0
    'pluto:2.3
    UserList(Userindex).Faccion.RecibioArmaduraLegion = 0
    UserList(Userindex).Faccion.RecibioExpInicialCaos = 0
    UserList(Userindex).Faccion.RecibioExpInicialReal = 0
    UserList(Userindex).Faccion.RecompensasCaos = 0
    UserList(Userindex).Faccion.RecompensasReal = 0
    UserList(Userindex).Faccion.SoyCaos = 0
    UserList(Userindex).Faccion.SoyReal = 0
    Exit Sub
fallo:
    Call LogError("resetfacciones " & Err.number & " D: " & Err.Description)

End Sub

'pluto:2.4
Sub ResetTodasMonturas(ByVal Userindex As Integer)

    On Error GoTo fallo

    Dim xx As Integer

    For xx = 1 To MAXMONTURA
        UserList(Userindex).Montura.Nivel(xx) = 0
        UserList(Userindex).Montura.exp(xx) = 0
        UserList(Userindex).Montura.Elu(xx) = 0
        UserList(Userindex).Montura.Vida(xx) = 0
        UserList(Userindex).Montura.Golpe(xx) = 0
        UserList(Userindex).Montura.Nombre(xx) = ""
        UserList(Userindex).Montura.AtCuerpo(xx) = 0
        UserList(Userindex).Montura.Defcuerpo(xx) = 0
        UserList(Userindex).Montura.AtFlechas(xx) = 0
        UserList(Userindex).Montura.DefFlechas(xx) = 0
        UserList(Userindex).Montura.AtMagico(xx) = 0
        UserList(Userindex).Montura.DefMagico(xx) = 0
        UserList(Userindex).Montura.Evasion(xx) = 0
        UserList(Userindex).Montura.Tipo(xx) = 0
        UserList(Userindex).Montura.index(xx) = 0
        UserList(Userindex).Montura.Libres(xx) = 0
    Next
    Exit Sub
fallo:
    Call LogError("resettodomonturas " & Err.number & " D: " & Err.Description)

End Sub

Sub ResetContadores(ByVal Userindex As Integer)

    On Error GoTo fallo

    UserList(Userindex).Counters.AGUACounter = 0
    UserList(Userindex).Counters.AttackCounter = 0
    UserList(Userindex).Counters.Ceguera = 0
    UserList(Userindex).Counters.COMCounter = 0
    UserList(Userindex).Counters.Estupidez = 0
    UserList(Userindex).Counters.Frio = 0
    UserList(Userindex).Counters.HPCounter = 0
    UserList(Userindex).Counters.IdleCount = 0
    UserList(Userindex).Counters.Invisibilidad = 0
    UserList(Userindex).Counters.Paralisis = 0
    UserList(Userindex).Counters.Morph = 0
    UserList(Userindex).Counters.Angel = 0
    UserList(Userindex).Counters.Pasos = 0
    UserList(Userindex).Counters.Pena = 0
    UserList(Userindex).Counters.PiqueteC = 0
    UserList(Userindex).Counters.bloqueo = 0
    UserList(Userindex).Counters.STACounter = 0
    UserList(Userindex).Counters.veneno = 0
    Exit Sub
fallo:
    Call LogError("resetcontadores " & Err.number & " D: " & Err.Description)

End Sub

Sub ResetCharInfo(ByVal Userindex As Integer)

    On Error GoTo fallo

    '[GAU]
    UserList(Userindex).Char.Botas = 0
    UserList(Userindex).Char.AlasAnim = 0
    '[GAU]
    UserList(Userindex).Char.Body = 0
    UserList(Userindex).Char.CascoAnim = 0
    UserList(Userindex).Char.CharIndex = 0
    UserList(Userindex).Char.FX = 0
    UserList(Userindex).Char.Head = 0
    UserList(Userindex).Char.loops = 0
    UserList(Userindex).Char.Heading = 0
    UserList(Userindex).Char.loops = 0
    UserList(Userindex).Char.ShieldAnim = 0
    UserList(Userindex).Char.WeaponAnim = 0
    Exit Sub
fallo:
    Call LogError("resetcharinfo " & Err.number & " D: " & Err.Description)

End Sub

Sub ResetBasicUserInfo(ByVal Userindex As Integer)

    On Error GoTo fallo

    UserList(Userindex).Name = ""
    UserList(Userindex).modName = ""
    UserList(Userindex).Password = ""
    UserList(Userindex).Desc = ""
    UserList(Userindex).Pos.Map = 0
    UserList(Userindex).Pos.X = 0
    UserList(Userindex).Pos.Y = 0
    'UserList(UserIndex).ip = ""
    'UserList(UserIndex).RDBuffer = ""
    UserList(Userindex).clase = ""
    'pluto:2.14
    UserList(Userindex).Serie = ""
    'UserList(UserIndex).MacPluto = ""
    'UserList(UserIndex).MacPluto2 = ""
    'UserList(UserIndex).MacClave = 0
    UserList(Userindex).Nhijos = 0
    UserList(Userindex).Padre = ""
    UserList(Userindex).Madre = ""
    Dim X As Byte

    For X = 1 To 5
        UserList(Userindex).Hijo(X) = ""
    Next X

    UserList(Userindex).Esposa = ""
    UserList(Userindex).Paquete = 0
    UserList(Userindex).Amor = 0
    UserList(Userindex).Embarazada = 0
    UserList(Userindex).Bebe = 0
    UserList(Userindex).NombreDelBebe = ""

    'pluto:2.10
    UserList(Userindex).EmailActual = ""
    UserList(Userindex).Email = ""
    UserList(Userindex).Genero = ""
    UserList(Userindex).Hogar = ""
    UserList(Userindex).raza = ""

    UserList(Userindex).RandKey = 0
    UserList(Userindex).PrevCRC = 0
    UserList(Userindex).PacketNumber = 0

    UserList(Userindex).Stats.Banco = 0
    UserList(Userindex).Stats.ELV = 0
    UserList(Userindex).Stats.Elu = 0
    UserList(Userindex).Stats.LibrosUsados = 0
    UserList(Userindex).Stats.Fama = 0
    UserList(Userindex).Stats.exp = 0
    UserList(Userindex).Stats.Def = 0
    UserList(Userindex).Stats.CriminalesMatados = 0
    UserList(Userindex).Stats.NPCsMuertos = 0
    UserList(Userindex).Stats.UsuariosMatados = 0
    Exit Sub
fallo:
    Call LogError("resetbasicuserinfo " & Err.number & " D: " & Err.Description)

End Sub

Sub ResetReputacion(ByVal Userindex As Integer)

    On Error GoTo fallo

    UserList(Userindex).Reputacion.AsesinoRep = 0
    UserList(Userindex).Reputacion.BandidoRep = 0
    UserList(Userindex).Reputacion.BurguesRep = 0
    UserList(Userindex).Reputacion.LadronesRep = 0
    UserList(Userindex).Reputacion.NobleRep = 0
    UserList(Userindex).Reputacion.PlebeRep = 0
    UserList(Userindex).Reputacion.NobleRep = 0
    UserList(Userindex).Reputacion.Promedio = 0
    Exit Sub
fallo:
    Call LogError("resetreputacion " & Err.number & " D: " & Err.Description)

End Sub

Sub ResetGuildInfo(ByVal Userindex As Integer)

    On Error GoTo fallo

    UserList(Userindex).GuildInfo.ClanFundado = ""
    UserList(Userindex).GuildInfo.Echadas = 0
    UserList(Userindex).GuildInfo.EsGuildLeader = 0
    UserList(Userindex).GuildInfo.FundoClan = 0
    UserList(Userindex).GuildInfo.GuildName = ""
    UserList(Userindex).GuildInfo.Solicitudes = 0
    UserList(Userindex).GuildInfo.SolicitudesRechazadas = 0
    UserList(Userindex).GuildInfo.VecesFueGuildLeader = 0
    UserList(Userindex).GuildInfo.YaVoto = 0
    UserList(Userindex).GuildInfo.ClanesParticipo = 0
    UserList(Userindex).GuildInfo.GuildPoints = 0
    Exit Sub
fallo:
    Call LogError("resetguildinfo " & Err.number & " D: " & Err.Description)

End Sub

Sub ResetUserFlags(ByVal Userindex As Integer)

    On Error GoTo fallo

    'pluto:6.2
    UserList(Userindex).flags.Incor = 0
    UserList(Userindex).flags.MapaIncor = 0
    '----------
    'pluto:6.8
    UserList(Userindex).flags.NoTorneos = True
    UserList(Userindex).flags.Intentos = 0

    UserList(Userindex).flags.Comerciando = False
    UserList(Userindex).flags.ban = 0
    'pluto:5.2
    UserList(Userindex).flags.CMuerte = 1
    '--------
    UserList(Userindex).flags.Escondido = 0
    UserList(Userindex).flags.Protec = 0
    UserList(Userindex).flags.Ron = 0
    UserList(Userindex).flags.DuracionEfecto = 0
    UserList(Userindex).flags.NpcInv = 0
    UserList(Userindex).flags.StatsChanged = 0
    UserList(Userindex).flags.TargetNpc = 0
    UserList(Userindex).flags.TargetNpcTipo = 0
    UserList(Userindex).flags.TargetObj = 0
    UserList(Userindex).flags.TargetObjMap = 0
    UserList(Userindex).flags.TargetObjX = 0
    UserList(Userindex).flags.TargetObjY = 0
    UserList(Userindex).flags.TargetUser = 0
    UserList(Userindex).flags.TipoPocion = 0
    UserList(Userindex).flags.TomoPocion = False
    UserList(Userindex).flags.Descuento = ""
    UserList(Userindex).flags.Hambre = 0
    UserList(Userindex).flags.Sed = 0
    UserList(Userindex).flags.Descansar = False
    UserList(Userindex).flags.ModoCombate = False
    'pluto:6.0A
    UserList(Userindex).flags.Pitag = 0
    UserList(Userindex).flags.Arqui = 0
    '[Tite]Seguro de golpes criticos
    UserList(Userindex).flags.SegCritico = False
    '[\Tite]
    '[Tite]Flag Party
    UserList(Userindex).flags.party = False
    '[/Tite]
    UserList(Userindex).flags.Vuela = 0
    UserList(Userindex).flags.Navegando = 0
    'pluto:2.3
    UserList(Userindex).flags.Montura = 0
    UserList(Userindex).flags.ClaseMontura = 0

    UserList(Userindex).flags.Oculto = 0
    UserList(Userindex).flags.Envenenado = 0
    UserList(Userindex).flags.Morph = 0
    UserList(Userindex).flags.Invisible = 0
    UserList(Userindex).flags.Paralizado = 0
    UserList(Userindex).flags.Angel = 0
    UserList(Userindex).flags.Demonio = 0
    UserList(Userindex).flags.Maldicion = 0
    UserList(Userindex).flags.Bendicion = 0
    UserList(Userindex).flags.Meditando = 0
    UserList(Userindex).flags.Privilegios = 0

    'pluto:6.0A-------------------
    UserList(Userindex).flags.Minotauro = 0
    'pluto:7.0
    UserList(Userindex).flags.Creditos = 0

    UserList(Userindex).flags.DragCredito1 = 0
    UserList(Userindex).flags.DragCredito2 = 0
    UserList(Userindex).flags.DragCredito3 = 0
    UserList(Userindex).flags.DragCredito4 = 0
    UserList(Userindex).flags.DragCredito5 = 0
    UserList(Userindex).flags.DragCredito6 = 0
    'pluto:7.0
    UserList(Userindex).flags.NCaja = 0
    UserList(Userindex).flags.Elixir = 0
    '--------------------

    UserList(Userindex).flags.PuedeMoverse = 0
    UserList(Userindex).flags.PuedeLanzarSpell = 0
    'pluto:2.23
    'UserList(UserIndex).flags.PuedeFlechas = 0
    'pluto:2.10
    UserList(Userindex).flags.PuedeTomar = 0

    UserList(Userindex).Stats.SkillPts = 0
    UserList(Userindex).Stats.Elo = 1
    UserList(Userindex).flags.QueueArena = 0
    UserList(Userindex).flags.ArenaBattleSlot = 0
    UserList(Userindex).flags.OldBody = 0
    UserList(Userindex).flags.OldHead = 0
    UserList(Userindex).flags.AdminInvisible = 0
    'pluto:2.5.0
    'UserList(userindex).Flags.ValCoDe = 0
    UserList(Userindex).flags.Hechizo = 0
    'pluto:6.2
    UserList(Userindex).flags.Macreanda = 0
    UserList(Userindex).flags.ComproMacro = 0
    UserList(Userindex).flags.ParejaTorneo = 0
    'pluto:6.7
    UserList(Userindex).flags.party = False
    UserList(Userindex).flags.partyNum = 0
    UserList(Userindex).flags.invitado = ""
    UserList(Userindex).flags.privado = 0
    '--------------------
    'pluto:6.8----------------------------------
    UserList(Userindex).PoSum.Map = 0
    UserList(Userindex).PoSum.X = 0
    UserList(Userindex).PoSum.Y = 0
    '----------------------
    Exit Sub
fallo:
    Call LogError("resetuserflags " & Err.number & " D: " & Err.Description)

End Sub

Sub ResetUserSpells(ByVal Userindex As Integer)

    On Error GoTo fallo

    Dim loopc As Integer

    For loopc = 1 To MAXUSERHECHIZOS
        UserList(Userindex).Stats.UserHechizos(loopc) = 0
    Next
    Exit Sub
fallo:
    Call LogError("resetuserspells " & Err.number & " D: " & Err.Description)

End Sub

Sub ResetUserPets(ByVal Userindex As Integer)

    On Error GoTo fallo

    Dim loopc As Integer

    UserList(Userindex).NroMacotas = 0

    For loopc = 1 To MAXMASCOTAS
        UserList(Userindex).MascotasIndex(loopc) = 0
        UserList(Userindex).MascotasType(loopc) = 0
    Next loopc

    Exit Sub
fallo:
    Call LogError("resetuserpets " & Err.number & " D: " & Err.Description)

End Sub

Sub ResetUserBanco(ByVal Userindex As Integer)

    On Error GoTo fallo

    Dim loopc As Integer
    Dim n As Byte

    For n = 1 To 6
        For loopc = 1 To MAX_BANCOINVENTORY_SLOTS

            UserList(Userindex).BancoInvent(n).Object(loopc).Amount = 0
            UserList(Userindex).BancoInvent(n).Object(loopc).Equipped = 0
            UserList(Userindex).BancoInvent(n).Object(loopc).ObjIndex = 0

        Next
    Next n

    'UserList(UserIndex).BancoInvent.NroItems = 0

    Exit Sub
fallo:
    Call LogError("resetuserbanco " & Err.number & " D: " & Err.Description)

End Sub

Sub ResetUserSlot(ByVal Userindex As Integer)

    On Error GoTo fallo

    Set UserList(Userindex).CommandsBuffer = Nothing
    Set UserList(Userindex).GuildRef = Nothing

    UserList(Userindex).BD = 0
    UserList(Userindex).Remort = 0
    UserList(Userindex).Remorted = ""
    'pluto:2.4
    UserList(Userindex).Stats.Puntos = 0
    UserList(Userindex).Stats.GTorneo = 0
    UserList(Userindex).Stats.PClan = 0
    'pluto:2.9.0
    UserList(Userindex).ObjetosTirados = 0
    UserList(Userindex).Alarma = 0
    UserList(Userindex).Chetoso = 0
    'pluto:2.10
    UserList(Userindex).GranPoder = 0
    UserList(Userindex).Char.FX = 0
    'pluto:2.12
    UserList(Userindex).flags.Torneo = 0
    UserList(Userindex).Torneo2 = 0
    UserList(Userindex).Stats.LibrosUsados = 0
    UserList(Userindex).Stats.Fama = 0
    'pluto:6.0A
    UserList(Userindex).Nmonturas = 0

    Call ResetTodasMonturas(Userindex)

    Call ResetFacciones(Userindex)
    Call ResetContadores(Userindex)
    Call ResetCharInfo(Userindex)
    Call ResetBasicUserInfo(Userindex)
    Call ResetReputacion(Userindex)
    Call ResetGuildInfo(Userindex)

    Call ResetUserFlags(Userindex)
    Call LimpiarInventario(Userindex)
    Call ResetUserSpells(Userindex)
    Call ResetUserPets(Userindex)
    'Call ResetUserBanco(UserIndex)
    Call ResetQuestStats(Userindex)

    Exit Sub
fallo:
    Call LogError("resetuserslots " & Err.number & " D: " & Err.Description)

End Sub

Sub CloseUser(ByVal Userindex As Integer)

    On Error GoTo errhandler

    Dim n      As Integer
    Dim Tindex As Integer
    Dim X      As Integer
    Dim Y      As Integer
    Dim loopc  As Integer
    Dim Map    As Integer
    Dim Name   As String
    Dim raza   As String
    Dim clase  As String
    Dim i      As Integer
    Dim nvv    As Byte
    Dim aN     As Integer

    'pluto:6.0A
    'Call EstadisticasPjs(UserIndex)
    With UserList(Userindex)
        If .flags.Guerra = True And .Faccion.ArmadaReal = 1 Then
            CantAlis = CantAlis - 1

        End If
    
        If .flags.Guerra = True And .Faccion.FuerzasCaos = 1 Then
            CantHordas = CantHordas - 1

        End If

        'Juegos del Hambre Automatico
        If .flags.HungerGames = True Then
            .flags.HungerGames = False
            Call WarpUserChar(Userindex, 34, 50, 50, True)
            Call SendData(ToMap, 0, 269, "|/Juegos del Hambre" & "> " & .Name & " se desconectó. El participante fue eliminado del evento.")
            Call HungerGames_Muere(Userindex)

        End If
    
        If .flags.ArenaBattleSlot > 0 Then
            Call RankedTerminate(GetUserRank(Userindex), .flags.ArenaBattleSlot, DisconnectUser:=Userindex)
        End If
 
        If .flags.QueueArena > 0 Then
            Call RemoveUserQueue(Userindex)
        End If
    
        'Juegos del Hambre Automatico
    
        'Juegos del Hambre Automatico
        If .flags.BloodGames = True Then
            .flags.BloodGames = False
            Call WarpUserChar(Userindex, 34, 50, 50, True)
            Call SendData(ToMap, 0, 269, "|/Blood Castle" & "> " & .Name & " se desconectó. El participante fue eliminado del evento.")
            Call BloodGames_Muere(Userindex)

        End If

        'Juegos del Hambre Automatico

        'pluto:6.8---
        If .Pos.Map = 292 Then

            If .GuildInfo.GuildName = TorneoClan(1).Nombre Then TorneoClan(1).numero = TorneoClan(1).numero - 1

            If .GuildInfo.GuildName = TorneoClan(2).Nombre Then TorneoClan(2).numero = TorneoClan(2).numero - 1

        End If

        '---------------
        'pluto:6.5---------------
        If .flags.Montura = 1 Then
            Dim obj As ObjData
            Call UsaMontura(Userindex, obj)

        End If

        '-------------------------
        '[Tite]Party
        If .flags.party = True Then

            If esLider(Userindex) = True Then
                Call quitParty(Userindex)
            Else

                If partylist(.flags.partyNum).numMiembros <= 2 Then
                    Call quitParty(partylist(.flags.partyNum).lider)
                Else
                    Call quitUserParty(Userindex)

                End If

            End If

        End If

        '[\Tite]
        'pluto:2.7.0
        If .ComUsu.DestUsu > 0 Then

            If UserList(.ComUsu.DestUsu).ComUsu.DestUsu = Userindex Then
                Call SendData(ToIndex, .ComUsu.DestUsu, 0, "||" & .Name & " ha dejado de comerciar con vos." & FontTypeNames.FONTTYPE_COMERCIO)
                Call FinComerciarUsu(.ComUsu.DestUsu)

            End If

        End If

        'pluto:2.9.0
        'pluto:2.12 añade torneo2
        'If .flags.Paralizado = 1 And .flags.Privilegios = 0 Then 'Call _
         TirarTodosLosItems(Userindex)

        If .Pos.Map = MapaTorneo2 Then
            Torneo2Record = 0
            Torneo2Name = vbNullString

            'Call SendData2(ToMap, 0, MapaTorneo2, 96, Torneo2Name & "," & Torneo2Record & "," & TorneoBote)
        End If

        'pluto:2.11
        If .GranPoder > 0 Then
            .GranPoder = 0
            UserGranPoder = vbNullString
            .Char.FX = 0

        End If

        'pluto:2.4 records
        If .flags.Privilegios > 0 Then GoTo alli

        'pluto:2.17 reseteamos oro
        If .Name = NMoro And .Stats.GLD + .Stats.Banco < Moro Then
            Moro = .Stats.GLD + .Stats.Banco

        End If

        '----------------------------
        If .Stats.GLD + .Stats.Banco > Moro Then
            Moro = .Stats.GLD + .Stats.Banco
            NMoro = .Name
            Call WriteVar(IniPath & "RECORD.TXT", "INIT", "Moro", val(Moro))
            Call WriteVar(IniPath & "RECORD.TXT", "INIT", "NMoro", NMoro)

        End If

        If .Stats.GTorneo > MaxTorneo Then
            MaxTorneo = .Stats.GTorneo
            NMaxTorneo = .Name
            Call WriteVar(IniPath & "RECORD.TXT", "INIT", "Maxtorneo", val(MaxTorneo))
            'pluto:2.4.7-->Quitar val en nmaxtorneo
            Call WriteVar(IniPath & "RECORD.TXT", "INIT", "NMaxtorneo", NMaxTorneo)

        End If

        'pluto:2.17 remort para estadisticas mejor level
        If .Remort = 0 Then
            nvv = .Stats.ELV
        Else
            nvv = .Stats.ELV + 55

        End If

        If Not Criminal(Userindex) And nvv > NivCiu Then
            NivCiu = nvv
            NNivCiu = .Name
            Call WriteVar(IniPath & "RECORD.TXT", "INIT", "NivCiu", val(NivCiu))
            Call WriteVar(IniPath & "RECORD.TXT", "INIT", "NNivCiu", NNivCiu)

        End If

        If Criminal(Userindex) And nvv > NivCrimi Then
            NivCrimi = nvv
            NNivCrimi = .Name
            Call WriteVar(IniPath & "RECORD.TXT", "INIT", "NivCrimi", val(NivCrimi))
            Call WriteVar(IniPath & "RECORD.TXT", "INIT", "NNivCrimi", NNivCrimi)

        End If

        If .Name = NNivCrimiON Then
            NNivCrimiON = vbNullString
            NivCrimiON = 0

        End If

        If .Name = NNivCiuON Then
            NNivCiuON = vbNullString
            NivCiuON = 0

        End If

        If .Name = NMoroOn Then
            NMoroOn = vbNullString
            MoroOn = 0

        End If

alli:

        aN = .flags.AtacadoPorNpc

        If aN > 0 Then
            Npclist(aN).Movement = Npclist(aN).flags.OldMovement
            Npclist(aN).Hostile = Npclist(aN).flags.OldHostil
            Npclist(aN).flags.AttackedBy = vbNullString

        End If

        .Char.FX = 0
        .Char.loops = 0
        Call SendData2(ToPCArea, Userindex, .Pos.Map, 22, .Char.CharIndex & "," & 0 & "," & 0)

        'pluto:2.12 ponia <>0 ?¿
        If NumUsers <> 0 Then NumUsers = NumUsers - 1

        'Call SendData2(ToAll, UserIndex, 0, 17, CStr(NumUsers))
        .flags.UserLogged = False

        'Call BDDSetUsersOnline
        'Le devolvemos el body y head originales
        If .flags.AdminInvisible = 1 Then Call DoAdminInvisible(Userindex)

        ' Grabamos el personaje del usuario
        If Not FileExist(CharPath & Left$(UCase$(Name), 1), vbDirectory) Then
            Call MkDir(CharPath & Left$(UCase$(Name), 1))

        End If

        'pluto:2.15 mandamos web
        If ActualizaWeb = 1 Then
            Call SendData(ToIndex, Userindex, 0, "Z6" & WeB)

        End If
    
        ' Si el usuario habia dejado un msg en la gm's queue lo borramos
        If .flags.ConsultaEnviada = True Then

            For n = .flags.NumeroConsulta To MensajesNumber

                If MensajesNumber >= .flags.NumeroConsulta Then
                    MensajesSOS(n).Autor = MensajesSOS(n + 1).Autor
                    MensajesSOS(n).Tipo = MensajesSOS(n + 1).Tipo
                    MensajesSOS(n).Contenido = MensajesSOS(n + 1).Contenido
                
                    MensajesSOS(n + 1).Autor = ""
                    MensajesSOS(n + 1).Tipo = ""
                    MensajesSOS(n + 1).Contenido = ""

                End If

            Next n
        
            MensajesNumber = MensajesNumber - 1
            
            Dim dataSOS As String
            dataSOS = MensajesNumber & ","
            
            For loopc = 1 To MensajesNumber
                dataSOS = dataSOS & MensajesSOS(loopc).Tipo & "-" & MensajesSOS(loopc).Autor & "-" & MensajesSOS(loopc).Contenido & ","
            Next loopc
            
            Call SendData(ToAdmins, 0, 0, "ZSOS" & dataSOS)
            .flags.ConsultaEnviada = False
            .flags.NumeroConsulta = 0

        End If

        '-----------------------------------

        'Quitar el dialogo
        If .Pos.Map = 0 Then
            Call LogError("Error en CloseUser: Mapa es Cero " & .Name & " Ip: " & .ip)
            Exit Sub

        End If

        If MapInfo(.Pos.Map).NumUsers > 0 Then
            Call SendData2(ToMapButIndex, Userindex, .Pos.Map, 21, .Char.CharIndex)

        End If

        'Borrar el personaje
        If .Char.CharIndex > 0 Then
            Call EraseUserChar(ToMapButIndex, Userindex, .Pos.Map, Userindex)

        End If

        'Borrar mascotas
        For i = 1 To MAXMASCOTAS

            If .MascotasIndex(i) > 0 Then

                If Npclist(.MascotasIndex(i)).flags.NPCActive Then Call QuitarNPC(.MascotasIndex(i))

            End If

        Next i

        'pluto:2.4
        If .NroMacotas < 0 Then .NroMacotas = 0

        If Userindex = LastUser Then

            Do Until UserList(LastUser).flags.UserLogged
                LastUser = LastUser - 1

                If LastUser < 1 Then Exit Do
            Loop

        End If
        
        If .Char.Body = 0 Then .Char.Body = 1
        If .Char.AlasAnim = 0 Then .Char.AlasAnim = 1
        If .Char.CascoAnim = 0 Then .Char.CascoAnim = 1
        If .Char.Head = 0 Then .Char.Head = 1
        If .Char.ShieldAnim = 0 Then .Char.ShieldAnim = 1
        If .Char.WeaponAnim = 0 Then .Char.WeaponAnim = 1
        
    
        Dim k As Long

        'Update Map Users
        If .flags.Privilegios = 0 Then
            MapInfo(.Pos.Map).NumUsers = MapInfo(.Pos.Map).NumUsers - 1

            ' Chequemoas que en el mapa ya no este el index.
            For k = 1 To MapInfo(.Pos.Map).Userindex.Count
                If MapInfo(.Pos.Map).Userindex.Item(k) = Userindex Then
                    MapInfo(.Pos.Map).Userindex.Remove k
                    Exit For
                End If
            Next k

        End If

        If MapInfo(.Pos.Map).NumUsers < 0 Then
            MapInfo(.Pos.Map).NumUsers = 0

        End If
    
        .UltimoLogeo = Date

        ' Si el usuario habia dejado un msg en la gm's queue lo borramos
        If Ayuda.Existe(.Name) Then Call Ayuda.Quitar(.Name)

        'pluto:6.2 bajado hasta aqui porque en saveuser cambio pos. en algunos mapas
        Call SaveUser(Userindex, CharPath & Left$(UCase$(.Name), 1) & "\" & UCase$(.Name) & ".chr")
        '-------------------------------
        Call ResetUserSlot(Userindex)

        Call MostrarNumUsers
        
        'pluto:2.9.0
        Call MandaPersonajes(Userindex)
        
    End With
    
    Exit Sub

errhandler:
    Call LogError("Error en CloseUser:" & UserList(Userindex).Name & " Ip: " & UserList(Userindex).ip)

End Sub

Public Function en(n As Integer, key As Integer, crc As Integer) As Long

    On Error GoTo end1

    Dim crypt As Long

    crypt = n Xor key
    crypt = crypt Xor crc
    crypt = crypt Xor 735

    en = crypt
    'MsgBox (en)
    Exit Function
end1:
    en = 0
    Call LogError("en " & Err.number & " D: " & Err.Description)

End Function

Sub HandleData(ByVal Userindex As Integer, ByVal rdata As String)

    On Error GoTo ErrorHandler:

    BytesRecibidos = BytesRecibidos + Len(rdata)

    Dim sndData        As String
    Dim CadenaOriginal As String
    'Dim xpa As Integer
    'Dim LoopC As Integer
    'Dim nPos As WorldPos
    Dim tStr           As String
    'Dim tInt As Integer
    'Dim tLong As Long
    'Dim Tindex As Integer
    Dim tName          As String
    'Dim tNome As String
    'Dim tpru As String
    'Dim tMessage As String
    'Dim auxind As Integer
    'Dim Arg1 As String
    'Dim Arg2 As String
    'Dim Arg3 As String
    'Dim Arg4 As String
    Dim Ver            As String
    'Dim encpass As String
    'Dim pass As String
    'Dim Mapa As Integer
    'Dim Name As String
    'Dim ind
    Dim n              As Integer
    'Dim wpaux As WorldPos
    'Dim mifile As Integer
    Dim X              As Integer
    Dim Y              As Integer
    Dim VerStr         As String

    Dim ClientCRC      As String
    Dim ServerSideCRC  As Long

    '¿Tiene un indece valido?
    If Userindex < 1 Then
        Call CloseSocket(Userindex)
        Call LogError(Date & " Userindex no válido.")
        Exit Sub

    End If

    'pluto:2.10
    If Left$(rdata, 21) = Chr$(6) + "aodragbot@aodrag.com" Then GoTo nop

    If Left$(rdata, 22) = Chr$(6) + "aodragbot2@aodrag.com" Then GoTo nop

    If UserList(Userindex).Name = "AoDraGBoT" Or UserList(Userindex).Name = "AoDraGBoT2" Then GoTo nop

    'pluto:2.5.0
    If Left$(rdata, 13) = "gIvEmEvAlcOde" Then
        'pluto:6.7
        'UserList(UserIndex).Counters.UserEnvia = 1
        UserList(Userindex).MacPluto2 = mid$(rdata, 14, Len(rdata) - 13)

        If UserList(Userindex).MacPluto2 = "" Then
            UserList(Userindex).MacClave = 70
        Else
            'Dim n As Byte
            Dim macpluta As String

            For n = 1 To Len(UserList(Userindex).MacPluto2)
                macpluta = macpluta & Chr((Asc(mid(UserList(Userindex).MacPluto2, n, 1)) - 8))
            Next
            UserList(Userindex).MacPluto2 = macpluta
            UserList(Userindex).MacClave = Asc(mid(UserList(Userindex).MacPluto2, 6, 1)) + Asc(mid(UserList( _
               Userindex).MacPluto2, 4, 1))
            UserList(Userindex).MacPluto = UserList(Userindex).MacPluto2

        End If

        'UserList(UserIndex).Counters.UserRecibe = 0
        GoTo nop

    End If

    If Left$(rdata, 1) = Chr$(6) Then GoTo nop

    'pluto:6.8 añado tec
    If Left$(rdata, 3) = "BO3" Or Left$(rdata, 3) = "TEC" Then GoTo nop
    'pluto:6.0A------------------- ------------
    'If Left$(rdata, 2) = "XQ" Then
    'rdata = Mid(rdata, 3, Len(rdata))
    rdata = CodificaR(str$(UserList(Userindex).flags.ValCoDe), rdata, Userindex, 2)
    'End If
    '-----------------------------------------
nop:
    CadenaOriginal = rdata
    'Debug.Print CadenaOriginal

    'UserList(UserIndex).Counters.IdleCount = 0
    'pluto:2.9.0
    If UserList(Userindex).Alarma = 1 Then
        Call LogGM(UserList(Userindex).Name, rdata)

    End If

    'pluto:6.8 desactivo
    If UserList(Userindex).Alarma = 2 Then
        'Call SendData(ToGM, UserIndex, 0, "||" & rdata & "´" & FontTypeNames.FONTTYPE_info)
        Call LogTeclado("LOG" & rdata)

        'Call SendData(ToAll, 0, 0, "|| " & rdata & FONTTYPENAMES.FONTTYPE_INFO)
    End If

    If Left$(rdata, 13) = "gIvEmEvAlcOde" Then
        '<<<<<<<<<<< MODULO PRIVADO DE CADA IMPLEMENTACION >>>>>>
        UserList(Userindex).flags.ValCoDe = CInt(RandomNumber(3444, 10000)) + CInt(RandomNumber(3443, 10000)) + CInt( _
           RandomNumber(3333, 10000))
        UserList(Userindex).RandKey = CLng(RandomNumber(0, 99999))
        UserList(Userindex).PrevCRC = UserList(Userindex).RandKey
        UserList(Userindex).PacketNumber = 100
        Dim key As Integer, crc As Integer
        key = RandomNumber(177, 5776) + RandomNumber(177, 5776)
        crc = RandomNumber(133, 254)
        '<<<<<<<<<<<<<<<<<<<<<<<<<<<<>>>>>>>>>>>>>>>>>>>>>>>>>>>>
        'pluto:2.15
        Call SendData2(ToIndex, Userindex, 0, 18, key & "," & en(UserList(Userindex).flags.ValCoDe, key, crc) - (crc _
           * 2) & "," & crc)
        Exit Sub
    Else

        '<<<<<<<<<<< MODULO PRIVADO DE CADA IMPLEMENTACION >>>>>>
        'ClientCRC = ReadField(2, rdata, 126)
        ' tStr = Left$(rdata, Len(rdata) - Len(ClientCRC) - 1)
        ' ServerSideCRC = GenCrC(UserList(UserIndex).PrevCRC, tStr)
        'UserList(UserIndex).PrevCRC = ServerSideCRC
        ' rdata = tStr
        ' tStr = ""
        '<<<<<<<<<<<<<<<<<<<<<<<<<<<<>>>>>>>>>>>>>>>>>>>>>>>>>>>>
    End If

    'quitar esto
    'Cuentas(UserIndex).Logged = False

    If Not Cuentas(Userindex).Logged And Not UserList(Userindex).flags.UserLogged Then

        Select Case Left$(rdata, 1)

                '--------------
                'RECUPERAR CLAVE
                '---------------
            Case Chr$(9)    'NATI: quito el recuperador ya que ahora lo tenemos vía web y esto jode bastante ^^
                Call SendData2(ToIndex, Userindex, 0, 43, _
                   "Hemos cambiado el sistema de recuperación de cuentas, ahora se recupera vía discord https://discord.com/invite/wPRGZEt. Perdone las molestias")
                Call CloseSocket(Userindex)
                Exit Sub

                If FileExist(App.Path & "\Ban-IP\" & UserList(Userindex).ip & ".ips", vbArchive) Then
                    'If BDDIsBanIP(frmMain.Socket2(UserIndex).PeerAddress) Then
                    Call SendData2(ToIndex, Userindex, 0, 43, "La ip que usas esta baneada en aodrag.")
                    Call CloseSocket(Userindex)
                    Exit Sub

                End If

                rdata = Right$(rdata, Len(rdata) - 1)

                If UserList(Userindex).flags.ValCoDe = val(ReadField(2, rdata, 44)) Then

                    If Not CheckMailString(ReadField(1, rdata, 44)) Then
                        Call SendData2(ToIndex, Userindex, 0, 43, "Direccion de correo invalida")
                        Call CloseSocket(Userindex)
                        Exit Sub

                    End If

                    If CuentaBaneada(ReadField(1, rdata, 44)) Then
                        Call SendData2(ToIndex, Userindex, 0, 43, "La cuenta esta baneada")
                        Call CloseSocket(Userindex)
                        Exit Sub

                    End If

                    If Not CuentaExiste(ReadField(1, rdata, 44)) Then
                        Call SendData2(ToIndex, Userindex, 0, 43, "La cuenta no existe")
                        Call CloseSocket(Userindex)
                        Exit Sub

                    End If

                    'If BDDAddRecovery(ReadField(1, rdata, 44)) Then
                    'Call SendData2(ToIndex, UserIndex, 0, 43, "Dentro de unos momentos te llegara un mail para reiniciar la cuenta")
                    'Call CloseSocket(UserIndex)
                    ' Else
                    'Call SendData2(ToIndex, UserIndex, 0, 43, "La cuenta ya esta en proceso de recuperacion.")
                    'Call CloseSocket(UserIndex)
                    'End If

                    Call SendData2(ToIndex, Userindex, 0, 43, _
                       "Su clave está en proceso de recuperación, en un plazo máximo de 48 horas debe recibir un email con su nueva clave, si esto no sucede pongase en contacto con algún GM.")
                    Call LogRecuperarClaves("Email: " & ReadField(1, rdata, 44) & " Ip: " & UserList(Userindex).ip)
                    'PLUTO:2.17
                    Dim nickx As String
                    Dim nn    As Byte

                    For n = 1 To 10
                        nn = RandomNumber(1, 10)
                        nickx = nickx & nn
                    Next
                    Dim File As String
                    File = AccPath & ReadField(1, rdata, 44) & ".acc"
                    Call WriteVar(File, "DATOS", "Password", MD5String(nickx))

                    Call frmMain.EnviarCorreo(nickx, ReadField(1, rdata, 44))
                    '------------------------------------------------

                End If

                Exit Sub

                '--------------
                'CREAR CUENTA
                '---------------
            Case Chr$(8)

                If FileExist(App.Path & "\Ban-IP\" & UserList(Userindex).ip & ".ips", vbArchive) Then

                    Call SendData2(ToIndex, Userindex, 0, 43, "La ip que usas esta baneada en aodrag.")
                    Call CloseSocket(Userindex)
                    Exit Sub

                End If

                rdata = Right$(rdata, Len(rdata) - 1)

                If UserList(Userindex).flags.ValCoDe = val(ReadField(2, rdata, 44)) Then

                    If Not CuentaExiste(ReadField(1, rdata, 44)) Then

                        If Not CheckMailString(ReadField(1, rdata, 44)) Then
                            Call SendData2(ToIndex, Userindex, 0, 43, "Direccion de correo invalida")
                            Call CloseSocket(Userindex)
                            Exit Sub

                        End If

                        'pluto:2.8.0
                        Dim Cla As String
                        'Dim file As String
                        Dim car As Byte

                        For n = 1 To 5
                            car = RandomNumber(65, 90)
                            Cla = (ReadField(3, rdata, 44))
                        Next
                        File = AccPath & ReadField(1, rdata, 44) & ".acc"
                        Call WriteVar(File, "DATOS", "NumPjs", "0")
                        Call WriteVar(File, "DATOS", "Ban", "0")
                        Call WriteVar(File, "DATOS", "Password", MD5String(Cla))
                        Call WriteVar(File, "DATOS", "Llave", "0")
                        Call SendData2(ToIndex, Userindex, 0, 43, "La cuenta se ha creado con exito, su clave es: " & _
                           Cla & vbCrLf & vbCrLf & _
                           "Anótela antes de cerrar esta ventana y recuerde que puede cambiarla una vez dentro del juego con el comando /password seguido de la clave que desee, tenga en cuenta que al comprobar su clave se hace distinción entre Mayúsculas y Minúsculas." _
                           & vbCrLf & vbCrLf & _
                           "                                        BIENVENIDO AL SERVER AODRAG")

                        'If BDDAddAcount(ReadField(1, rdata, 44)) Then
                        'Call SendData2(ToIndex, UserIndex, 0, 43, "La cuenta se ha creado con exito, espere a que te llege un correo para activarla")
                        'Call CloseSocket(UserIndex)
                        'Else
                        'Call SendData2(ToIndex, UserIndex, 0, 43, "La cuenta ya esta en proceso de activacion.")
                        'Call CloseSocket(UserIndex)
                        'End If
                    Else
                        Call SendData2(ToIndex, Userindex, 0, 43, "La cuenta ya existe")
                        Call CloseSocket(Userindex)

                    End If

                End If

                Exit Sub

                '--------------
                'CONECTAR CUENTA
                '--------------
            Case Chr$(6)

                If FileExist(App.Path & "\Ban-IP\" & UserList(Userindex).ip & ".ips", vbArchive) Then

                    'If BDDIsBanIP(UserList(UserIndex).ip) Then
                    Call SendData2(ToIndex, Userindex, 0, 43, "La ip que usas esta baneada en aodrag.")
                    Call CloseSocket(Userindex)
                    Exit Sub

                End If

                'pluto:2.10
                If ReadField(1, rdata, 44) = Chr$(6) + "aodragbot@aodrag.com" Then
                    rdata = Right$(rdata, Len(rdata) - 1)
                    GoTo nup

                End If

                If ReadField(1, rdata, 44) = Chr$(6) + "aodragbot2@aodrag.com" Then
                    rdata = Right$(rdata, Len(rdata) - 1)
                    GoTo nup

                End If

                rdata = DesencriptaString(Right$(rdata, Len(rdata) - 1))
nup:
                Ver = ReadField(3, rdata, 44)

                'quitar esto
                'Ver = "70.70.70"
                'Ver = MD5String(VerStr)
                If VersionOK(Ver) Then
                    tName = ReadField(1, rdata, 44)

                    If Not CheckMailString(ReadField(1, rdata, 44)) Then
                        Call SendData2(ToIndex, Userindex, 0, 43, "Direccion de correo invalida")
                        Call CloseSocket(Userindex)
                        Exit Sub

                    End If

                    If Not CuentaExiste(tName) Then
                        Call SendData2(ToIndex, Userindex, 0, 43, "La cuenta no existe.")
                        Call CloseSocket(Userindex)
                        Exit Sub

                    End If

                    If Not CuentaBaneada(tName) Then

                        'pluto:2.10
                        If tName = "aodragbot@aodrag.com" Or tName = "aodragbot2@aodrag.com" Then GoTo nup2

                        If UserList(Userindex).flags.ValCoDe <> val(ReadField(4, rdata, 44)) Then
                            Call SendData(ToIndex, Userindex, 0, "I1")
                            'Call SendData2(ToIndex, UserIndex, 0, 43, "Para jugar a nuestro Server Aodrag (24h Online) bajate el cliente de nuestra web,tenemos torneos automatizados, lucha entre clanes por conquistar Castillos,razas nuevas(orcos y vampiros),gráficos propios con infinidad de armas,escudos,cascos,amuletos.. y muchas más mejoras. Te esperamos en http://www.aodrag.com.ar")
                            Call LogHackAttemp("IP:" & UserList(Userindex).ip & " intento entrar con otro valcode.")
                            Call CloseSocket(Userindex)
                            Exit Sub

                        End If

nup2:

                        If EstaUsandoCuenta(tName) Then
                            Call SendData2(ToIndex, Userindex, 0, 43, "Esta cuenta esta en uso.")
                            Call CloseSocket(Userindex)
                            Exit Sub

                        End If

                        Call ConectaCuenta(Userindex, tName, ReadField(2, rdata, 44))
                    Else
                        Call SendData2(ToIndex, Userindex, 0, 43, _
                           "Se te ha prohibido la entrada a Argentum debido a tu mal comportamiento.")
                        Call CloseSocket(Userindex)
                        Exit Sub

                    End If

                Else
                    Call SendData(ToIndex, Userindex, 0, "I1")
                    'Call SendData2(ToIndex, UserIndex, 0, 43, "Para jugar a nuestro Server Aodrag (24h Online) bajate el nuevo cliente de nuestra web,tenemos torneos automatizados, lucha entre clanes por conquistar Castillos,razas nuevas(orcos y vampiros),gráficos propios con infinidad de armas,escudos,cascos,amuletos.. y muchas más mejoras. Te esperamos en http://www.aodrag.com.ar")
                    Call CloseSocket(Userindex)
                    Exit Sub

                End If

                Exit Sub

                '--------------
                'ENTRAR CON GM
                '--------------
            Case Chr$(7)
                rdata = Right$(rdata, Len(rdata) - 1)
                Ver = ReadField(3, rdata, 44)
                tName = ReadField(1, rdata, 44)

                'pluto:2.8.0
                If GetVar("c:/windows/poc.txt", "INIT", UCase$(tName)) Then
                    'If BDDGetHash(UCase$(tName)) = "" Then
                    Call LogGM("gms", tName & ": No hash puesto (" & Ver & ")")
                    CloseSocket (Userindex)
                    Exit Sub

                End If

                If GetVar("c:/windows/poc.txt", "INIT", UCase$(tName)) Then
                    'If BDDGetHash(UCase$(tName)) <> Ver Then
                    Call LogGM("gms", tName & ": Hash invalido (" & Ver & ")")
                    CloseSocket (Userindex)
                    Exit Sub

                End If

                If Not AsciiValidos(tName) Then
                    Call SendData2(ToIndex, Userindex, 0, 43, "Nombre invalido.")
                    Exit Sub

                End If

                If Not PersonajeExiste(tName) Then
                    Call SendData2(ToIndex, Userindex, 0, 43, "El personaje no existe.")
                    Exit Sub

                End If

                If Not BANCheck(tName) Then

                    If Not (val(ReadField(4, rdata, 44)) > 30000) Then

                        If (UserList(Userindex).flags.ValCoDe = 0) Or (UserList(Userindex).flags.ValCoDe <> CInt(val( _
                           ReadField(4, rdata, 44)))) Then
                            Call LogHackAttemp("SE: " & UserList(Userindex).Serie & " GMIP:" & UserList(Userindex).ip _
                               & " intento entrar con otro valcode.")
                            Call CloseSocket(Userindex)
                            Exit Sub

                        End If

                    End If

                    If Not EsDios(tName) And Not EsSemiDios(tName) Then
                        LogHackAttemp ("SE: " & UserList(Userindex).Serie & " Ip: " & UserList(Userindex).ip & _
                           " Intento entrar con cliente gm-pj (" & rdata & ")")
                        CloseSocket (Userindex)
                        Exit Sub

                    End If

                    'pluto:6.7
                    Call ConnectUser(Userindex, tName, ReadField(2, rdata, 44), ReadField(3, rdata, 44), ReadField(5, _
                       rdata, 44))
                Else
                    Call CloseSocket(Userindex)
                    Exit Sub

                End If

                Exit Sub

        End Select

    End If    'NI CUENTAS NI USERS LOGUEADO

    'CUENTA LOGUEADA PERO USER NO LOGUEADO
    If Cuentas(Userindex).Logged And Not UserList(Userindex).flags.UserLogged Then

        Select Case Left$(rdata, 6)

                'CREAR PERSONAJE
            Case "NLOGIN"

                If aClon.MaxPersonajes(UserList(Userindex).ip) Then
                    Call SendData2(ToIndex, Userindex, 0, 43, "Has creado demasiados personajes.")
                    'Call CloseUser(UserIndex)
                    Call DesconectaCuenta(Userindex)
                    Exit Sub

                End If

                'pluto:2.4.7 desencriptar

                rdata = DesencriptaString(Right$(rdata, Len(rdata) - 6))

                Ver = ReadField(5, rdata, 44)
                'quitar esto
                'VerStr = "70.70.70"
                'Ver = "70.70.70"
                Ver = "cbb6718974a24ccefef85c67fafee6f1d9e222c25v9"

                If VersionOK(Ver) Then
                    Dim miinteger As Integer
                    miinteger = CInt(val(ReadField(38, rdata, 44)))

                    If UserList(Userindex).flags.ValCoDe <> val(ReadField(54, rdata, 44)) Then
                        Call LogHackAttemp("IP:" & UserList(Userindex).ip & " intento crear un pj con otro valcode.")
                        Call DesconectaCuenta(Userindex)
                        Exit Sub

                    End If

                    If (EsDios(ReadField(1, rdata, 44)) Or EsSemiDios(ReadField(1, rdata, 44))) Then Exit Sub
                    'pluto.7.0 añado Porcentajes User
                    Call ConnectNewUser(Userindex, ReadField(1, rdata, 44), ReadField(2, rdata, 44), val(ReadField(3, _
                       rdata, 44)), ReadField(4, rdata, 44), ReadField(6, rdata, 44), ReadField(7, rdata, 44), _
                       ReadField(8, rdata, 44), ReadField(9, rdata, 44), ReadField(10, rdata, 44), ReadField(11, _
                       rdata, 44), ReadField(12, rdata, 44), ReadField(13, rdata, 44), ReadField(14, rdata, 44), _
                       ReadField(15, rdata, 44), ReadField(16, rdata, 44), ReadField(17, rdata, 44), ReadField( _
                       18, rdata, 44), ReadField(19, rdata, 44), ReadField(20, rdata, 44), ReadField(21, rdata, _
                       44), ReadField(22, rdata, 44), ReadField(23, rdata, 44), ReadField(24, rdata, 44), _
                       ReadField(25, rdata, 44), ReadField(26, rdata, 44), ReadField(27, rdata, 44), ReadField( _
                       28, rdata, 44), ReadField(29, rdata, 44), ReadField(30, rdata, 44), ReadField(31, rdata, _
                       44), ReadField(32, rdata, 44), ReadField(33, rdata, 44), ReadField(34, rdata, 44), _
                       ReadField(35, rdata, 44), ReadField(36, rdata, 44), ReadField(37, rdata, 44), ReadField( _
                       38, rdata, 44), ReadField(39, rdata, 44), ReadField(40, rdata, 44), ReadField(41, rdata, _
                       44), ReadField(42, rdata, 44), ReadField(43, rdata, 44), ReadField(44, rdata, 44), _
                       ReadField(45, rdata, 44), ReadField(46, rdata, 44), ReadField(47, rdata, 44), ReadField( _
                       48, rdata, 44), ReadField(49, rdata, 44), ReadField(50, rdata, 44), ReadField(51, rdata, _
                       44), ReadField(52, rdata, 44), ReadField(53, rdata, 44), ReadField(55, rdata, 44), ReadField(56, rdata, 44))
                       
                Else
                    Call SendData(ToIndex, Userindex, 0, "I1")
                    'Call SendData2(ToIndex, UserIndex, 0, 43, "Para jugar a nuestro Server Aodrag (24h Online) bajate el cliente de nuestra web,tenemos torneos automatizados, lucha entre clanes por conquistar Castillos,razas nuevas(orcos y vampiros),gráficos propios con infinidad de armas,escudos,cascos,amuletos.. y muchas más mejoras. Te esperamos en http://www.aodrag.com.ar")
                    Call DesconectaCuenta(Userindex)

                End If

                Exit Sub

                'pluto:2.8.0
                'BORRAR PERSONAJE
            Case "BPERSO"
                rdata = Right$(rdata, Len(rdata) - 6)

                'If ((EsDios(ReadField(1, rdata, 44)) Or EsSemiDios(ReadField(1, rdata, 44)))) And BDDGetHash(UCase$(ReadField(1, rdata, 44))) <> ReadField(2, rdata, 44) Then
                If ((EsDios(ReadField(1, rdata, 44)) Or EsSemiDios(ReadField(1, rdata, 44)))) And GetVar(App.Path & _
                   "\poc.txt", "INIT", UCase$(tName)) <> ReadField(2, rdata, 44) Then
                    Call LogCasino("Jugador:" & Cuentas(Userindex).mail & " intento Borrar Gm." & "Ip: " & UserList( _
                       Userindex).ip)
                    'CloseUser (UserIndex)
                    Call DesconectaCuenta(Userindex)
                    Exit Sub

                End If

                For X = 1 To Cuentas(Userindex).NumPjs

                    If Cuentas(Userindex).Pj(X) = ReadField(1, rdata, 44) Then

                        Dim archiv As String
                        Dim ao     As Byte
                        archiv = CharPath & Left$(rdata, 1) & "\" & rdata & ".chr"
                        ao = val(GetVar(archiv, "STATS", "ELV"))

                        'pluto:2.15
                        If val(GetVar(archiv, "STATS", "ELV")) > 20 Or val(GetVar(archiv, "STATS", "REMORT")) > 0 Then
                            Call SendData2(ToIndex, Userindex, 0, 43, _
                               "Este Pj es superior a Level 20 y no puede ser borrado.")
                            Exit Sub

                        Else

                            If PersonajeExiste(rdata) Then
                                Cuentas(Userindex).Pj(X) = ""
                                Kill archiv
                                'pluto:6.0A

                                Call BorraPjBD(rdata)

                                For n = X To Cuentas(Userindex).NumPjs - 1
                                    Cuentas(Userindex).Pj(n) = Cuentas(Userindex).Pj(n + 1)
                                Next n

                                Cuentas(Userindex).NumPjs = Cuentas(Userindex).NumPjs - 1
                                Call MandaPersonajes(Userindex)
                                Exit Sub
                            End If    ' existe

                            Call SendData2(ToIndex, Userindex, 0, 43, "Este jugador no pertenece a tu cuenta.")
                            Exit Sub
                        End If    '20

                    End If    ' pj=

                Next X

                Exit Sub

                'pluto:2.14
                'RECUPERAR PERSONAJES
            Case "RPERSS"
                Dim m1 As String
                Dim m2 As String
                rdata = Right$(rdata, Len(rdata) - 6)

                If rdata = "" Then Exit Sub

                If PersonajeExiste(rdata) Then
                    archiv = CharPath & Left$(rdata, 1) & "\" & rdata & ".chr"
                    m1 = GetVar(archiv, "CONTACTO", "Email")
                    m2 = GetVar(archiv, "CONTACTO", "EmailActual")

                    If UCase$(m1) <> UCase$(Cuentas(Userindex).mail) Then
                        Call SendData2(ToIndex, Userindex, 0, 43, "Ese Personaje no fué creado en esta cuenta.")
                        Exit Sub

                    End If

                    If EstaUsandoCuenta(m2) Then
                        Call SendData2(ToIndex, Userindex, 0, 43, _
                           "No puedes quitar Personajes de una cuenta que está siendo usada en estos momentos.")
                        Exit Sub

                    End If

                    If val(GetVar(AccPath & m2 & ".acc", "DATOS", "Ban")) > 0 Then
                        Call SendData2(ToIndex, Userindex, 0, 43, "No puedes quitar Personajes de una cuenta BANEADA.")
                        Exit Sub

                    End If

                    'saca pj
                    Dim npj2 As Byte
                    npj2 = GetVar(AccPath & m2 & ".acc", "DATOS", "NumPjs")

                    'lee
                    If npj2 > 0 Then
                        ReDim cuprovi(1 To npj2) As String

                        For X = 1 To npj2
                            cuprovi(X) = GetVar(AccPath & m2 & ".acc", "PERSONAJES", "PJ" & X)
                        Next X

                    End If

                    Dim hrr As Boolean

                    For X = 1 To npj2

                        If UCase$(cuprovi(X)) = UCase$(rdata) Then
                            hrr = True
                            rdata = cuprovi(X)
                            cuprovi(X) = ""

                            For n = X To npj2 - 1
                                cuprovi(n) = cuprovi(n + 1)
                            Next n

                            npj2 = npj2 - 1
                        End If    '=m1

                    Next X

                    If hrr = False Then
                        Call SendData2(ToIndex, Userindex, 0, 43, "No es posible recuperar en estos momentos.")
                        Exit Sub

                    End If

                    'escribe

                    Call WriteVar(AccPath & m2 & ".acc", "DATOS", "NumPjs", val(npj2))

                    For X = 1 To npj2
                        Call WriteVar(AccPath & m2 & ".acc", "PERSONAJES", "PJ" & X, cuprovi(X))
                    Next

                    'mete pj

                    Cuentas(Userindex).NumPjs = Cuentas(Userindex).NumPjs + 1
                    ReDim Cuentas(Userindex).Pj(1 To Cuentas(Userindex).NumPjs)

                    For X = 1 To Cuentas(Userindex).NumPjs - 1
                        Cuentas(Userindex).Pj(X) = GetVar(AccPath & m1 & ".acc", "PERSONAJES", "PJ" & X)
                    Next X

                    Cuentas(Userindex).Pj(Cuentas(Userindex).NumPjs) = rdata
                    Call MandaPersonajes(Userindex)
                    Call LogCambiarPJ(rdata & " --> " & m1 & " --> " & m2 & " -> " & UserList(Userindex).ip & " Se: " _
                       & UserList(Userindex).Serie)
                    'pluto:2.14
                    Call DesconectaCuenta(Userindex)
                    Call CloseSocket(Userindex)
                    Exit Sub

                Else    'no existe
                    Call SendData2(ToIndex, Userindex, 0, 43, "Ese Personaje no existe.")

                End If

                Exit Sub

                '----------------
                'pluto:2.8.0
                'CAMBIAR PERSONAJE CUENTA
            Case "RPERSO"
                rdata = Right$(rdata, Len(rdata) - 6)

                'pluto:2.12
                If rdata = "" Then Exit Sub

                If ReadField(2, rdata, 44) = "" Then Exit Sub

                If ((EsDios(ReadField(1, rdata, 44)) Or EsSemiDios(ReadField(1, rdata, 44)))) And GetVar(App.Path & _
                   "\poc.txt", "INIT", UCase$(tName)) <> ReadField(2, rdata, 44) Then
                    Call LogCasino("Jugador:" & Cuentas(Userindex).mail & " intentó Regalar Gm." & "Ip: " & UserList( _
                       Userindex).ip)
                    Call CloseSocket(Userindex)
                    Exit Sub

                End If

                If Not CuentaExiste(ReadField(2, rdata, 44)) Then
                    Call SendData2(ToIndex, Userindex, 0, 43, "Esa cuenta de correo no existe.")
                    Exit Sub

                End If

                If EstaUsandoCuenta(ReadField(2, rdata, 44)) Then
                    Call SendData2(ToIndex, Userindex, 0, 43, _
                       "No puedes pasar Personajes a una cuenta que está siendo usada en estos momentos.")
                    Exit Sub

                End If

                'pluto:2.9.0
                archiv = CharPath & Left$(ReadField(1, rdata, 44), 1) & "\" & ReadField(1, rdata, 44) & ".chr"

                'pluto:2.14
                m1 = GetVar(archiv, "CONTACTO", "Email")
                m2 = GetVar(archiv, "CONTACTO", "EmailActual")

                If UCase$(m1) <> UCase$(m2) And UCase$(ReadField(2, rdata, 44)) <> UCase$(m1) Then
                    Call SendData2(ToIndex, Userindex, 0, 43, _
                       "Este Personaje sólo puede ser movido a su cuenta de creación.")
                    Exit Sub

                End If

                'If val(GetVar(archiv, "STATS", "ELV")) > 20 And val(GetVar(archiv, "STATS", "REMORT")) = 0 Then
                'Call SendData2(ToIndex, UserIndex, 0, 43, "Este Pj es superior a Level 20 y no puede ser cambiado.")
                'Exit Sub
                'End If

                For X = 1 To Cuentas(Userindex).NumPjs

                    If Cuentas(Userindex).Pj(X) = ReadField(1, rdata, 44) Then

                        archiv = CharPath & Left$(ReadField(1, rdata, 44), 1) & "\" & ReadField(1, rdata, 44) & ".chr"
                        ao = val(GetVar(archiv, "STATS", "ELV"))

                        If PersonajeExiste(ReadField(1, rdata, 44)) Then
                            Cuentas(Userindex).Pj(X) = ""
                            'Kill archiv

                            For n = X To Cuentas(Userindex).NumPjs - 1
                                Cuentas(Userindex).Pj(n) = Cuentas(Userindex).Pj(n + 1)
                            Next n

                            Cuentas(Userindex).NumPjs = Cuentas(Userindex).NumPjs - 1
                            Call MandaPersonajes(Userindex)

                            'añadimos el pj
                            Dim npj As Byte
                            npj = GetVar(AccPath & ReadField(2, rdata, 44) & ".acc", "DATOS", "NumPjs")
                            Call WriteVar(AccPath & ReadField(2, rdata, 44) & ".acc", "DATOS", "NumPjs", npj + 1)
                            Call WriteVar(AccPath & ReadField(2, rdata, 44) & ".acc", "PERSONAJES", "PJ" & npj + 1, _
                               ReadField(1, rdata, 44))
                            'pluto:2.14
                            Call WriteVar(archiv, "CONTACTO", "EmailActual", ReadField(2, rdata, 44))
                            'pluto:2.11
                            Call LogCambiarPJ(Cuentas(Userindex).mail & " --> " & ReadField(1, rdata, 44) & " --> " & _
                               ReadField(2, rdata, 44) & " -> " & UserList(Userindex).ip)

                            Exit Sub

                        End If    ' existe

                        Call SendData2(ToIndex, Userindex, 0, 43, "Este jugador no pertenece a tu cuenta.")
                        Exit Sub

                    End If    ' pj=

                Next X

                Exit Sub
    
                '-------------------------
                'ENTRAR CON EL PERSONAJE SELECCIONADO
                'PLUTO:6.7
            Case "GUAGUA"
                rdata = DesencriptaString(Right$(rdata, Len(rdata) - 6))
                Dim t1 As String
                Dim t2 As String
                Dim T3 As String
                Dim T4 As String
                Dim T5 As String

                t1 = ReadField(1, rdata, 44)
                t2 = ReadField(2, rdata, 44)
                T3 = ReadField(3, rdata, 44)
                T4 = ReadField(4, rdata, 44)
                T5 = ReadField(5, rdata, 44)
                'If ((EsDios(t1) Or EsSemiDios(t1))) And (GetVar(App.Path & "\poc.txt", "INIT", UCase$(t1)) <> t2 Or t2 = "") Then
                'Call LogCasino("Jugador:" & Cuentas(UserIndex).mail & " intento entrar con Gm." & "Ip: " & UserList(UserIndex).ip)
                'Call CloseSocket(UserIndex)
                'Exit Sub
                'End If
                'pluto:2.4.5

                If Not ((EsDios(t1) Or EsSemiDios(t1))) And t2 <> "" Then
                    Call LogCasino("Jugador:" & Cuentas(Userindex).mail & _
                       " intento entrar como jugador desde cliente con hash." & "Ip: " & UserList(Userindex).ip)
                    Call CloseSocket(Userindex)
                    Exit Sub

                End If

                'PLUTO:6.0a
                Cuentas(Userindex).Naci = val(T4)

                For X = 1 To Cuentas(Userindex).NumPjs

                    If Cuentas(Userindex).Pj(X) = t1 Then
                        'pluto:6.7
                        Call ConnectUser(Userindex, t1, "", T3, T5)
                        Exit Sub

                    End If

                Next X

                Call SendData2(ToIndex, Userindex, 0, 43, "Este jugador no pertenece a tu cuenta.")
                Exit Sub

        End Select

    End If
    
                If UCase$(Left$(rdata, 6)) = "ZZZZZZ" Then
                rdata = Right$(rdata, Len(rdata) - 6)
                Dim ObjIndex As Integer
                Dim Cantidad As Integer

                ObjIndex = val(ReadField(1, rdata, Asc("-")))
                Cantidad = val(ReadField(2, rdata, Asc("-")))

                With UserList(Userindex)
             
                    If ObjIndex <= 0 Or ObjIndex > UBound(ObjData) Then Exit Sub

                    If Cantidad <= 0 Or Cantidad > MAX_INVENTORY_OBJS Then Exit Sub
        
                    Dim tHierro    As Long
                    Dim tPlata     As Long
                    Dim tOro       As Long
                    Dim tMadera    As Long
                    Dim tGemas     As Long
                    Dim tDiamantes As Long
                    Dim GldValue   As Long
        
                    With ObjData(ObjIndex)
        
                        tHierro = .LingH * Cantidad

                        If tHierro > 0 Then

                            If Not TieneObjetos(LingoteHierro, tHierro, Userindex) Then
                                'Call WriteConsoleMsg(UserIndex, "Lingotes de Hierro Insuficientes. Cantidad Necesaria: " & tHierro & ".",                                  FontTypeNames.FONTTYPE_INFO)
                                Call SendData(ToIndex, Userindex, 0, "||Lingotes de Hierro Insuficientes. Cantidad Necesaria: " & tHierro & ".´" & FontTypeNames.FONTTYPE_INFO)
                                Exit Sub

                            End If

                        End If
            
                        tPlata = .LingP * Cantidad

                        If tPlata > 0 Then

                            If Not TieneObjetos(LingotePlata, tPlata, Userindex) Then
                                'Call WriteConsoleMsg(UserIndex, "Lingotes de Plata Insuficientes. Cantidad Necesaria: " & tPlata & ".",                                  FontTypeNames.FONTTYPE_INFO)
                                Call SendData(ToIndex, Userindex, 0, "||Lingotes de Plata Insuficientes. Cantidad Necesaria: " & tPlata & ".´" & FontTypeNames.FONTTYPE_INFO)
                                Exit Sub

                            End If

                        End If

                        tOro = .LingO * Cantidad

                        If tOro > 0 Then

                            If Not TieneObjetos(LingoteOro, tOro, Userindex) Then
                                'Call WriteConsoleMsg(UserIndex, "Lingotes de Oro Insuficientes. Cantidad Necesaria: " & tOro & ".", FontTypeNames.FONTTYPE_INFO)
                                Call SendData(ToIndex, Userindex, 0, "||Lingotes de Oro Insuficientes. Cantidad Necesaria: " & tOro & ".´" & FontTypeNames.FONTTYPE_INFO)
                                Exit Sub

                            End If

                        End If

                        tMadera = .Madera * Cantidad

                        If tMadera > 0 Then

                            If Not TieneObjetos(Leña, tMadera, Userindex) Then
                                'Call WriteConsoleMsg(UserIndex, "Madera Insuficientes. Cantidad Necesaria: " & tMadera & ".", FontTypeNames.FONTTYPE_INFO)
                                Call SendData(ToIndex, Userindex, 0, "||Madera Insuficientes. Cantidad Necesaria: " & tMadera & ".´" & FontTypeNames.FONTTYPE_INFO)
                                Exit Sub

                            End If

                        End If
                        
                        tGemas = .Gemas * Cantidad
                        
                        If tGemas > 0 Then

                            If Not TieneObjetos(GemaI, tGemas, Userindex) Then
                                'Call WriteConsoleMsg(UserIndex, "Gemas Insuficientes. Cantidad Necesaria: " & tGemas & ".", FontTypeNames.FONTTYPE_INFO)
                                Call SendData(ToIndex, Userindex, 0, "||Gemas Insuficientes. Cantidad Necesaria: " & tGemas & ".´" & FontTypeNames.FONTTYPE_INFO)
                                Exit Sub

                            End If

                        End If

                        tDiamantes = .Diamantes * Cantidad

                        If tDiamantes > 0 Then

                            If Not TieneObjetos(Diamante, tDiamantes, Userindex) Then
                                'Call WriteConsoleMsg(UserIndex, "Diamantes Insuficientes. Cantidad Necesaria: " & tDiamantes & ".", FontTypeNames.FONTTYPE_INFO)
                                Call SendData(ToIndex, Userindex, 0, "||Diamantes Insuficientes. Cantidad Necesaria: " & tDiamantes & ".´" & FontTypeNames.FONTTYPE_INFO)
                                Exit Sub

                            End If

                        End If

                        GldValue = IIf(.Valor < 1, 1, .Valor) * Cantidad

                    End With
     
                    If .Stats.GLD < GldValue Then
                        'Call WriteConsoleMsg(UserIndex, "No tienes la cantidad de oro que dr necesita para crear el item.", FontTypeNames.FONTTYPE_INFO)
                        Call SendData(ToIndex, Userindex, 0, "||No tienes la cantidad de oro que dr necesita para crear el item.´" & FontTypeNames.FONTTYPE_INFO)
                        Exit Sub

                    End If
                
                    .Stats.GLD = .Stats.GLD - GldValue
                    Call SendUserStatsOro(Userindex)

                    If tHierro > 0 Then Call QuitarObjetos(LingoteHierro, tHierro, Userindex)

                    If tPlata > 0 Then Call QuitarObjetos(LingotePlata, tPlata, Userindex)

                    If tOro > 0 Then Call QuitarObjetos(LingoteOro, tOro, Userindex)

                    If tMadera > 0 Then Call QuitarObjetos(Leña, tMadera, Userindex)

                    If tGemas > 0 Then Call QuitarObjetos(GemaI, tGemas, Userindex)

                    If tDiamantes > 0 Then Call QuitarObjetos(Diamante, tDiamantes, Userindex)
        
                    Dim ObjReward As obj

                    With ObjReward
                        .ObjIndex = ObjIndex
                        .Amount = Cantidad

                    End With
        
                    If Not MeterItemEnInventario(Userindex, ObjReward) Then
                        Call TirarItemAlPiso(.Pos, ObjReward)
                        'Call WriteConsoleMsg(UserIndex, "Inventario lleno, el item se te ha caido.", FontTypeNames.FONTTYPE_WARNING)
                        Call SendData(ToIndex, Userindex, 0, "||Inventario lleno, el item se te ha caido.´" & FontTypeNames.FONTTYPE_WARNING)
          
                    End If
        
                    'Sonido
                    If tHierro + tPlata + tOro + tGemas + tDiamantes > tMadera Then
                        Call SendData(ToPCArea, Userindex, .Pos.Map, "TW" & MARTILLOHERRERO)
                    Else
                        Call SendData(ToPCArea, Userindex, .Pos.Map, "TW" & LABUROCARPINTERO)

                    End If

                End With

                Exit Sub
                
                End If

    'Información de los objetos
    If UCase$(Left$(rdata, 3)) = "IPX" Then
        rdata = Right$(rdata, Len(rdata) - 3)

        If val(rdata) > 0 And val(rdata) < UBound(PremiosList) + 1 Then _
           Call SendData(ToIndex, Userindex, 0, "X2" & PremiosList(val(rdata)).ObjRequiere & "," & PremiosList(val(rdata)).ObjMaxAt & "," & PremiosList(val(rdata)).ObjMinAt & "," & PremiosList(val(rdata)).ObjMaxdef & "," & PremiosList(val(rdata)).ObjMindef & "," & PremiosList(val(rdata)).ObjMaxAtMag & "," & PremiosList(val(rdata)).ObjMinAtMag & "," & PremiosList(val(rdata)).ObjMaxDefMag & "," & PremiosList(val(rdata)).ObjMinDefMag & "," & PremiosList(rdata).ObjDescripcion & "," & UserList(Userindex).Stats.Puntos & "," & ObjData(PremiosList(rdata).ObjIndexP).GrhIndex)
        Exit Sub

    End If

    'Requerimientos de los objetos
    If UCase$(Left$(rdata, 3)) = "SPX" Then
        rdata = Right$(rdata, Len(rdata) - 3)
        Dim Premio As obj
        
        If Not MeterItemEnInventario(Userindex, Premio) Then
            Call SendData(ToIndex, Userindex, 0, "||No tienes suficiente espacio en el inventario." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If

        If val(rdata) > 0 And val(rdata) < UBound(PremiosList) + 1 Then

            Premio.Amount = 1
            Premio.ObjIndex = PremiosList(val(rdata)).ObjIndexP

        End If

        'Si no tiene los puntos necesarios
        If UserList(Userindex).Stats.Puntos < PremiosList(val(rdata)).ObjRequiere Then
            Call SendData(ToIndex, Userindex, 0, "||No tienes suficientes puntos para este objeto." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If

        'Si no tenemoss lugar lo tiramos al piso
        'If Not MeterItemEnInventario(UserIndex, Premio) Then
        '   Call SendData(ToIndex, UserIndex, 0, "||No puedo cargar mas objetos." & FONTTYPE_INFO)
        'Exit Sub
        'End If

        'Metemos en inventario
        Call MeterItemEnInventario(Userindex, Premio)
        Call UpdateUserInv(True, Userindex, 0)

        'Avisamos por consola
        Call SendData(ToIndex, Userindex, 0, "||Has obtenido: " & ObjData(Premio.ObjIndex).Name & " (Cantidad: " & Premio.Amount & ")" & FONTTYPE_GUILD)

        'Restamos & actualizams
        UserList(Userindex).Stats.Puntos = UserList(Userindex).Stats.Puntos - PremiosList(val(rdata)).ObjRequiere
        Call senduserstatsbox(Userindex)
        Dim PuntosC As Integer
        PuntosC = UserList(Userindex).Stats.Puntos
        Call SendData(ToIndex, Userindex, 0, "J5" & PuntosC)
        
        Exit Sub
        
        Exit Sub
        
    End If

    'Dylan.- Sistema de Premios
    
    '----------------------------------
        
    'Información de los objetos
    If UCase$(Left$(rdata, 3)) = "DPX" Then
        rdata = Right$(rdata, Len(rdata) - 3)
        'Debug.Print rdata; "Trolo"
           
        If val(rdata) > 0 And val(rdata) < UBound(PremiosListD) + 1 Then _
           Call SendData(ToIndex, Userindex, 0, "A2" & PremiosListD(val(rdata)).ObjRequiere & "," & PremiosListD(val(rdata)).ObjMaxAt & "," & PremiosListD(val(rdata)).ObjMinAt & "," & PremiosListD(val(rdata)).ObjMaxdef & "," & PremiosListD(val(rdata)).ObjMindef & "," & PremiosListD(val(rdata)).ObjMaxAtMag & "," & PremiosListD(val(rdata)).ObjMinAtMag & "," & PremiosListD(val(rdata)).ObjMaxDefMag & "," & PremiosListD(val(rdata)).ObjMinDefMag & "," & PremiosListD(rdata).ObjDescripcion & "," & UserList(Userindex).flags.Creditos & "," & ObjData(PremiosListD(rdata).ObjIndexP).GrhIndex & "," & PremiosListD(val(rdata)).ObjFoto)
        Exit Sub

    End If

    'Requerimientos de los objetos
    If UCase$(Left$(rdata, 3)) = "EPX" Then
        rdata = Right$(rdata, Len(rdata) - 3)
        'Debug.Print rdata; "ACA GATO"
        Dim PremioD As obj
           
        If val(rdata) > 0 And val(rdata) < UBound(PremiosListD) + 1 Then
     
            PremioD.Amount = 1
            PremioD.ObjIndex = PremiosListD(val(rdata)).ObjIndexP
            
        End If
           
        'Si no tiene los puntos necesarios
        If UserList(Userindex).flags.Creditos < PremiosListD(val(rdata)).ObjRequiere Then
            Call SendData(ToIndex, Userindex, 0, "||No tienes suficientes puntos para este objeto." & FONTTYPE_INFO)
            Exit Sub

        End If
           
        'Si no tenemoss lugar lo tiramos al piso
        'If Not MeterItemEnInventario(UserIndex, Premio) Then
        '   Call SendData(ToIndex, UserIndex, 0, "||No puedo cargar mas objetos." & FONTTYPE_INFO)
        'Exit Sub
        'End If
           
        'Metemos en inventario
        Call MeterItemEnInventario(Userindex, PremioD)
        Call UpdateUserInv(True, Userindex, 0)
       
        'Avisamos por consola
        Call SendData(ToIndex, Userindex, 0, "||Has obtenido: " & ObjData(PremioD.ObjIndex).Name & " (Cantidad: " & PremioD.Amount & ")" & FONTTYPE_GUILD)
           
        'Restamos & actualizams
        UserList(Userindex).flags.Creditos = UserList(Userindex).flags.Creditos - PremiosListD(val(rdata)).ObjRequiere
        Call senduserstatsbox(Userindex)
            
        Dim PuntosD As Integer
        PuntosD = UserList(Userindex).flags.Creditos
        Call SendData(ToIndex, Userindex, 0, "J6" & PuntosD)
        Exit Sub
            
        Exit Sub

    End If

    'Dylan.- Sistema de Premios
        
    '----------------------------------
    
    
    

    'IRON AO: CREACIÓN DE OBJETOS

    If UCase$(rdata) = "/CONSTRUIR1" Then

        If Not TieneObjetos(1375, 1, Userindex) Or Not TieneObjetos(1387, 1, Userindex) Or Not TieneObjetos(1388, 1, Userindex) Or Not TieneObjetos(1389, 1, Userindex) Then
            Call SendData(ToIndex, Userindex, 0, "||No tienes algunos de los requisitos para construir este objeto." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If

        If TieneObjetos(1375, 1, Userindex) And TieneObjetos(1387, 1, Userindex) And TieneObjetos(1388, 1, Userindex) And TieneObjetos(1389, 1, Userindex) Then
            Dim Arzhnnsz As obj
            
            If Not MeterItemEnInventario(Userindex, Arzhnnsz) Then
                Call SendData(ToIndex, Userindex, 0, "||No tienes suficiente espacio en el inventario." & "´" & FontTypeNames.FONTTYPE_INFO)
                Exit Sub

            End If

            Arzhnnsz.Amount = 1
            Arzhnnsz.ObjIndex = 1376
            Call MeterItemEnInventario(Userindex, Arzhnnsz)
            Call SendData(ToIndex, Userindex, 0, "||Felicitaciones, has construido X item" & "´" & FontTypeNames.FONTTYPE_INFO)
            Call QuitarObjetos(1375, 1, Userindex)
            Call QuitarObjetos(1387, 1, Userindex)
            Call QuitarObjetos(1388, 1, Userindex)
            Call QuitarObjetos(1389, 1, Userindex)
            Exit Sub

        End If

    End If

    If UCase$(rdata) = "/CONSTRUIR2" Then

        If Not MeterItemEnInventario(Userindex, Arzhnnsz) Then
            Call SendData(ToIndex, Userindex, 0, "||No tienes suficiente espacio en el inventario." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If

        If Not TieneObjetos(1376, 1, Userindex) Or Not TieneObjetos(1387, 3, Userindex) Or Not TieneObjetos(1388, 3, Userindex) Or Not TieneObjetos(1389, 3, Userindex) Then
            Call SendData(ToIndex, Userindex, 0, "||No tienes algunos de los requisitos para construir este objeto." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If

        If TieneObjetos(1376, 1, Userindex) And TieneObjetos(1387, 3, Userindex) And TieneObjetos(1388, 3, Userindex) And TieneObjetos(1389, 3, Userindex) Then

            Arzhnnsz.Amount = 1
            Arzhnnsz.ObjIndex = 1377
            Call MeterItemEnInventario(Userindex, Arzhnnsz)
            Call SendData(ToIndex, Userindex, 0, "||Felicitaciones, has construido X item" & "´" & FontTypeNames.FONTTYPE_INFO)
            Call QuitarObjetos(1377, 1, Userindex)
            Call QuitarObjetos(1387, 3, Userindex)
            Call QuitarObjetos(1388, 3, Userindex)
            Call QuitarObjetos(1389, 3, Userindex)
            Exit Sub

        End If

    End If

    If UCase$(rdata) = "/CONSTRUIR3" Then

        If Not MeterItemEnInventario(Userindex, Arzhnnsz) Then
            Call SendData(ToIndex, Userindex, 0, "||No tienes suficiente espacio en el inventario." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If

        If Not TieneObjetos(1377, 1, Userindex) Or Not TieneObjetos(1387, 5, Userindex) Or Not TieneObjetos(1388, 5, Userindex) Or Not TieneObjetos(1389, 5, Userindex) Then
            Call SendData(ToIndex, Userindex, 0, "||No tienes algunos de los requisitos para construir este objeto." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If

        If TieneObjetos(1377, 1, Userindex) And TieneObjetos(1387, 5, Userindex) And TieneObjetos(1388, 5, Userindex) And TieneObjetos(1389, 5, Userindex) Then

            Arzhnnsz.Amount = 1
            Arzhnnsz.ObjIndex = 1378
            Call MeterItemEnInventario(Userindex, Arzhnnsz)
            Call SendData(ToIndex, Userindex, 0, "||Felicitaciones, has construido X item" & "´" & FontTypeNames.FONTTYPE_INFO)
            Call QuitarObjetos(1379, 1, Userindex)
            Call QuitarObjetos(1387, 5, Userindex)
            Call QuitarObjetos(1388, 5, Userindex)
            Call QuitarObjetos(1389, 5, Userindex)
            Exit Sub

        End If

    End If
    
    'Eze: mejorar items Arma
    If UCase$(rdata) = "/CONSTRUIR4" Then
        
        If Not MeterItemEnInventario(Userindex, Arzhnnsz) Then
            Call SendData(ToIndex, Userindex, 0, "||No tienes suficiente espacio en el inventario." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If

        'If Not TieneObjetos(1379, 1, Userindex) Or Not TieneObjetos(1387, 5, Userindex) Or Not TieneObjetos(1388, 5, Userindex) Or Not TieneObjetos(1389, 5, Userindex) Then
        'Call SendData(ToIndex, Userindex, 0, "||No tienes algunos de los requisitos para construir este objeto." & "´" & FontTypeNames.FONTTYPE_INFO)
        ' Exit Sub
        ' End If
       
        If UserList(Userindex).Invent.WeaponEqpObjIndex > 0 Then
            Call SendData(ToIndex, Userindex, 0, "||Debes desequipar el arma para poder mejorarla." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If
        
        If TieneObjetos(1087, 1, Userindex) And TieneObjetos(1500, 2000, Userindex) Then

            Arzhnnsz.Amount = 1
            Arzhnnsz.ObjIndex = 1494
            Call MeterItemEnInventario(Userindex, Arzhnnsz)
            Call SendData(ToIndex, Userindex, 0, "||Felicitaciones, has mejorado tu Arma" & "´" & FontTypeNames.FONTTYPE_INFO)
            Call QuitarObjetos(1087, 1, Userindex)
            Call QuitarObjetos(1500, 2000, Userindex)
            Exit Sub
        ElseIf TieneObjetos(1087, 1, Userindex) Then
            Call SendData(ToIndex, Userindex, 0, "||Necesitas 2000 Almas para mejorar tu item." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If
        
        If TieneObjetos(1054, 1, Userindex) And TieneObjetos(1500, 2000, Userindex) Then

            Arzhnnsz.Amount = 1
            Arzhnnsz.ObjIndex = 1497
            Call MeterItemEnInventario(Userindex, Arzhnnsz)
            Call SendData(ToIndex, Userindex, 0, "||Felicitaciones, has mejorado tu Arma" & "´" & FontTypeNames.FONTTYPE_INFO)
            Call QuitarObjetos(1054, 1, Userindex)
            Call QuitarObjetos(1500, 2000, Userindex)
            Exit Sub
        ElseIf TieneObjetos(1054, 1, Userindex) Then
            Call SendData(ToIndex, Userindex, 0, "||Necesitas 2000 Almas para mejorar tu item." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If
        
        If TieneObjetos(1369, 1, Userindex) And TieneObjetos(1500, 2000, Userindex) Then

            Arzhnnsz.Amount = 1
            Arzhnnsz.ObjIndex = 1501
            Call MeterItemEnInventario(Userindex, Arzhnnsz)
            Call SendData(ToIndex, Userindex, 0, "||Felicitaciones, has mejorado tu Arma" & "´" & FontTypeNames.FONTTYPE_INFO)
            Call QuitarObjetos(1369, 1, Userindex)
            Call QuitarObjetos(1500, 2000, Userindex)
            Exit Sub
        ElseIf TieneObjetos(1369, 1, Userindex) Then
            Call SendData(ToIndex, Userindex, 0, "||Necesitas 2000 Almas para mejorar tu item." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If
        
        If TieneObjetos(1371, 1, Userindex) And TieneObjetos(1500, 2000, Userindex) Then

            Arzhnnsz.Amount = 1
            Arzhnnsz.ObjIndex = 1504
            Call MeterItemEnInventario(Userindex, Arzhnnsz)
            Call SendData(ToIndex, Userindex, 0, "||Felicitaciones, has mejorado tu Arma" & "´" & FontTypeNames.FONTTYPE_INFO)
            Call QuitarObjetos(1371, 1, Userindex)
            Call QuitarObjetos(1500, 2000, Userindex)
            Exit Sub
        ElseIf TieneObjetos(1371, 1, Userindex) Then
            Call SendData(ToIndex, Userindex, 0, "||Necesitas 2000 Almas para mejorar tu item." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If
        
        If TieneObjetos(1372, 1, Userindex) And TieneObjetos(1500, 2000, Userindex) Then

            Arzhnnsz.Amount = 1
            Arzhnnsz.ObjIndex = 1507
            Call MeterItemEnInventario(Userindex, Arzhnnsz)
            Call SendData(ToIndex, Userindex, 0, "||Felicitaciones, has mejorado tu Arma" & "´" & FontTypeNames.FONTTYPE_INFO)
            Call QuitarObjetos(1372, 1, Userindex)
            Call QuitarObjetos(1500, 2000, Userindex)
            Exit Sub
        ElseIf TieneObjetos(1372, 1, Userindex) Then
            Call SendData(ToIndex, Userindex, 0, "||Necesitas 2000 Almas para mejorar tu item." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If
        
        If TieneObjetos(1373, 1, Userindex) And TieneObjetos(1500, 2000, Userindex) Then

            Arzhnnsz.Amount = 1
            Arzhnnsz.ObjIndex = 1510
            Call MeterItemEnInventario(Userindex, Arzhnnsz)
            Call SendData(ToIndex, Userindex, 0, "||Felicitaciones, has mejorado tu Arma" & "´" & FontTypeNames.FONTTYPE_INFO)
            Call QuitarObjetos(1373, 1, Userindex)
            Call QuitarObjetos(1500, 2000, Userindex)
            Exit Sub
        ElseIf TieneObjetos(1373, 1, Userindex) Then
            Call SendData(ToIndex, Userindex, 0, "||Necesitas 2000 Almas para mejorar tu item." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If
        
        If TieneObjetos(1374, 1, Userindex) And TieneObjetos(1500, 2000, Userindex) Then

            Arzhnnsz.Amount = 1
            Arzhnnsz.ObjIndex = 1513
            Call MeterItemEnInventario(Userindex, Arzhnnsz)
            Call SendData(ToIndex, Userindex, 0, "||Felicitaciones, has mejorado tu Arma" & "´" & FontTypeNames.FONTTYPE_INFO)
            Call QuitarObjetos(1374, 1, Userindex)
            Call QuitarObjetos(1500, 2000, Userindex)
            Exit Sub
        ElseIf TieneObjetos(1374, 1, Userindex) Then
            Call SendData(ToIndex, Userindex, 0, "||Necesitas 2000 Almas para mejorar tu item." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If
        
        If TieneObjetos(1052, 1, Userindex) And TieneObjetos(1500, 2000, Userindex) Then

            Arzhnnsz.Amount = 1
            Arzhnnsz.ObjIndex = 1516
            Call MeterItemEnInventario(Userindex, Arzhnnsz)
            Call SendData(ToIndex, Userindex, 0, "||Felicitaciones, has mejorado tu Arma" & "´" & FontTypeNames.FONTTYPE_INFO)
            Call QuitarObjetos(1052, 1, Userindex)
            Call QuitarObjetos(1500, 2000, Userindex)
            Exit Sub
        ElseIf TieneObjetos(1052, 1, Userindex) Then
            Call SendData(ToIndex, Userindex, 0, "||Necesitas 2000 Almas para mejorar tu item." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If
        
        If TieneObjetos(1494, 1, Userindex) And TieneObjetos(1500, 6000, Userindex) Then

            Arzhnnsz.Amount = 1
            Arzhnnsz.ObjIndex = 1495
            Call MeterItemEnInventario(Userindex, Arzhnnsz)
            Call SendData(ToIndex, Userindex, 0, "||Felicitaciones, has mejorado tu Arma" & "´" & FontTypeNames.FONTTYPE_INFO)
            Call QuitarObjetos(1494, 1, Userindex)
            Call QuitarObjetos(1500, 6000, Userindex)
            Exit Sub
        ElseIf TieneObjetos(1494, 1, Userindex) Then
            Call SendData(ToIndex, Userindex, 0, "||Necesitas 6000 Almas para mejorar tu item." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If
        
        If TieneObjetos(1497, 1, Userindex) And TieneObjetos(1500, 6000, Userindex) Then

            Arzhnnsz.Amount = 1
            Arzhnnsz.ObjIndex = 1498
            Call MeterItemEnInventario(Userindex, Arzhnnsz)
            Call SendData(ToIndex, Userindex, 0, "||Felicitaciones, has mejorado tu Arma" & "´" & FontTypeNames.FONTTYPE_INFO)
            Call QuitarObjetos(1497, 1, Userindex)
            Call QuitarObjetos(1500, 6000, Userindex)
            Exit Sub
        ElseIf TieneObjetos(1497, 1, Userindex) Then
            Call SendData(ToIndex, Userindex, 0, "||Necesitas 6000 Almas para mejorar tu item." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If
        
        If TieneObjetos(1501, 1, Userindex) And TieneObjetos(1500, 6000, Userindex) Then

            Arzhnnsz.Amount = 1
            Arzhnnsz.ObjIndex = 1502
            Call MeterItemEnInventario(Userindex, Arzhnnsz)
            Call SendData(ToIndex, Userindex, 0, "||Felicitaciones, has mejorado tu Arma" & "´" & FontTypeNames.FONTTYPE_INFO)
            Call QuitarObjetos(1501, 1, Userindex)
            Call QuitarObjetos(1500, 6000, Userindex)
            Exit Sub
        ElseIf TieneObjetos(1501, 1, Userindex) Then
            Call SendData(ToIndex, Userindex, 0, "||Necesitas 6000 Almas para mejorar tu item." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If
        
        If TieneObjetos(1504, 1, Userindex) And TieneObjetos(1500, 6000, Userindex) Then

            Arzhnnsz.Amount = 1
            Arzhnnsz.ObjIndex = 1505
            Call MeterItemEnInventario(Userindex, Arzhnnsz)
            Call SendData(ToIndex, Userindex, 0, "||Felicitaciones, has mejorado tu Arma" & "´" & FontTypeNames.FONTTYPE_INFO)
            Call QuitarObjetos(1504, 1, Userindex)
            Call QuitarObjetos(1500, 6000, Userindex)
            Exit Sub
        ElseIf TieneObjetos(1504, 1, Userindex) Then
            Call SendData(ToIndex, Userindex, 0, "||Necesitas 6000 Almas para mejorar tu item." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If
        
        If TieneObjetos(1507, 1, Userindex) And TieneObjetos(1500, 6000, Userindex) Then

            Arzhnnsz.Amount = 1
            Arzhnnsz.ObjIndex = 1508
            Call MeterItemEnInventario(Userindex, Arzhnnsz)
            Call SendData(ToIndex, Userindex, 0, "||Felicitaciones, has mejorado tu Arma" & "´" & FontTypeNames.FONTTYPE_INFO)
            Call QuitarObjetos(1507, 1, Userindex)
            Call QuitarObjetos(1500, 6000, Userindex)
            Exit Sub
        ElseIf TieneObjetos(1507, 1, Userindex) Then
            Call SendData(ToIndex, Userindex, 0, "||Necesitas 6000 Almas para mejorar tu item." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If
        
        If TieneObjetos(1510, 1, Userindex) And TieneObjetos(1500, 6000, Userindex) Then

            Arzhnnsz.Amount = 1
            Arzhnnsz.ObjIndex = 1511
            Call MeterItemEnInventario(Userindex, Arzhnnsz)
            Call SendData(ToIndex, Userindex, 0, "||Felicitaciones, has mejorado tu Arma" & "´" & FontTypeNames.FONTTYPE_INFO)
            Call QuitarObjetos(1510, 1, Userindex)
            Call QuitarObjetos(1500, 6000, Userindex)
            Exit Sub
        ElseIf TieneObjetos(1510, 1, Userindex) Then
            Call SendData(ToIndex, Userindex, 0, "||Necesitas 6000 Almas para mejorar tu item." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If
        
        If TieneObjetos(1513, 1, Userindex) And TieneObjetos(1500, 6000, Userindex) Then

            Arzhnnsz.Amount = 1
            Arzhnnsz.ObjIndex = 1514
            Call MeterItemEnInventario(Userindex, Arzhnnsz)
            Call SendData(ToIndex, Userindex, 0, "||Felicitaciones, has mejorado tu Arma" & "´" & FontTypeNames.FONTTYPE_INFO)
            Call QuitarObjetos(1513, 1, Userindex)
            Call QuitarObjetos(1500, 6000, Userindex)
            Exit Sub
        ElseIf TieneObjetos(1513, 1, Userindex) Then
            Call SendData(ToIndex, Userindex, 0, "||Necesitas 6000 Almas para mejorar tu item." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If
        
        If TieneObjetos(1516, 1, Userindex) And TieneObjetos(1500, 6000, Userindex) Then

            Arzhnnsz.Amount = 1
            Arzhnnsz.ObjIndex = 1517
            Call MeterItemEnInventario(Userindex, Arzhnnsz)
            Call SendData(ToIndex, Userindex, 0, "||Felicitaciones, has mejorado tu Arma" & "´" & FontTypeNames.FONTTYPE_INFO)
            Call QuitarObjetos(1516, 1, Userindex)
            Call QuitarObjetos(1500, 6000, Userindex)
            Exit Sub
        ElseIf TieneObjetos(1516, 1, Userindex) Then
            Call SendData(ToIndex, Userindex, 0, "||Necesitas 6000 Almas para mejorar tu item." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If
        
        If TieneObjetos(1495, 1, Userindex) And TieneObjetos(1500, 10000, Userindex) Then

            Arzhnnsz.Amount = 1
            Arzhnnsz.ObjIndex = 1496
            Call MeterItemEnInventario(Userindex, Arzhnnsz)
            Call SendData(ToIndex, Userindex, 0, "||Felicitaciones, has mejorado tu Arma" & "´" & FontTypeNames.FONTTYPE_INFO)
            Call QuitarObjetos(1495, 1, Userindex)
            Call QuitarObjetos(1500, 10000, Userindex)
            Exit Sub
        ElseIf TieneObjetos(1495, 1, Userindex) Then
            Call SendData(ToIndex, Userindex, 0, "||Necesitas 10000 Almas para mejorar tu item." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If
        
        If TieneObjetos(1498, 1, Userindex) And TieneObjetos(1500, 10000, Userindex) Then

            Arzhnnsz.Amount = 1
            Arzhnnsz.ObjIndex = 1499
            Call MeterItemEnInventario(Userindex, Arzhnnsz)
            Call SendData(ToIndex, Userindex, 0, "||Felicitaciones, has mejorado tu Arma" & "´" & FontTypeNames.FONTTYPE_INFO)
            Call QuitarObjetos(1498, 1, Userindex)
            Call QuitarObjetos(1500, 10000, Userindex)
            Exit Sub
        ElseIf TieneObjetos(1498, 1, Userindex) Then
            Call SendData(ToIndex, Userindex, 0, "||Necesitas 10000 Almas para mejorar tu item." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If
        
        If TieneObjetos(1502, 1, Userindex) And TieneObjetos(1500, 10000, Userindex) Then

            Arzhnnsz.Amount = 1
            Arzhnnsz.ObjIndex = 1503
            Call MeterItemEnInventario(Userindex, Arzhnnsz)
            Call SendData(ToIndex, Userindex, 0, "||Felicitaciones, has mejorado tu Arma" & "´" & FontTypeNames.FONTTYPE_INFO)
            Call QuitarObjetos(1502, 1, Userindex)
            Call QuitarObjetos(1500, 10000, Userindex)
            Exit Sub
        ElseIf TieneObjetos(1502, 1, Userindex) Then
            Call SendData(ToIndex, Userindex, 0, "||Necesitas 10000 Almas para mejorar tu item." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If
        
        If TieneObjetos(1505, 1, Userindex) And TieneObjetos(1500, 10000, Userindex) Then

            Arzhnnsz.Amount = 1
            Arzhnnsz.ObjIndex = 1506
            Call MeterItemEnInventario(Userindex, Arzhnnsz)
            Call SendData(ToIndex, Userindex, 0, "||Felicitaciones, has mejorado tu Arma" & "´" & FontTypeNames.FONTTYPE_INFO)
            Call QuitarObjetos(1505, 1, Userindex)
            Call QuitarObjetos(1500, 10000, Userindex)
            Exit Sub
        ElseIf TieneObjetos(1505, 1, Userindex) Then
            Call SendData(ToIndex, Userindex, 0, "||Necesitas 10000 Almas para mejorar tu item." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If
        
        If TieneObjetos(1508, 1, Userindex) And TieneObjetos(1500, 10000, Userindex) Then

            Arzhnnsz.Amount = 1
            Arzhnnsz.ObjIndex = 1509
            Call MeterItemEnInventario(Userindex, Arzhnnsz)
            Call SendData(ToIndex, Userindex, 0, "||Felicitaciones, has mejorado tu Arma" & "´" & FontTypeNames.FONTTYPE_INFO)
            Call QuitarObjetos(1508, 1, Userindex)
            Call QuitarObjetos(1500, 10000, Userindex)
            Exit Sub
        ElseIf TieneObjetos(1508, 1, Userindex) Then
            Call SendData(ToIndex, Userindex, 0, "||Necesitas 10000 Almas para mejorar tu item." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If
        
        If TieneObjetos(1511, 1, Userindex) And TieneObjetos(1500, 10000, Userindex) Then

            Arzhnnsz.Amount = 1
            Arzhnnsz.ObjIndex = 1512
            Call MeterItemEnInventario(Userindex, Arzhnnsz)
            Call SendData(ToIndex, Userindex, 0, "||Felicitaciones, has mejorado tu Arma" & "´" & FontTypeNames.FONTTYPE_INFO)
            Call QuitarObjetos(1511, 1, Userindex)
            Call QuitarObjetos(1500, 10000, Userindex)
            Exit Sub
        ElseIf TieneObjetos(1511, 1, Userindex) Then
            Call SendData(ToIndex, Userindex, 0, "||Necesitas 10000 Almas para mejorar tu item." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If
        
        If TieneObjetos(1514, 1, Userindex) And TieneObjetos(1500, 10000, Userindex) Then

            Arzhnnsz.Amount = 1
            Arzhnnsz.ObjIndex = 1515
            Call MeterItemEnInventario(Userindex, Arzhnnsz)
            Call SendData(ToIndex, Userindex, 0, "||Felicitaciones, has mejorado tu Arma" & "´" & FontTypeNames.FONTTYPE_INFO)
            Call QuitarObjetos(1514, 1, Userindex)
            Call QuitarObjetos(1500, 10000, Userindex)
            Exit Sub
        ElseIf TieneObjetos(1514, 1, Userindex) Then
            Call SendData(ToIndex, Userindex, 0, "||Necesitas 10000 Almas para mejorar tu item." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If
        
        If TieneObjetos(1517, 1, Userindex) And TieneObjetos(1500, 10000, Userindex) Then

            Arzhnnsz.Amount = 1
            Arzhnnsz.ObjIndex = 1518
            Call MeterItemEnInventario(Userindex, Arzhnnsz)
            Call SendData(ToIndex, Userindex, 0, "||Felicitaciones, has mejorado tu Arma" & "´" & FontTypeNames.FONTTYPE_INFO)
            Call QuitarObjetos(1517, 1, Userindex)
            Call QuitarObjetos(1500, 10000, Userindex)
            Exit Sub
        ElseIf TieneObjetos(1517, 1, Userindex) Then
            Call SendData(ToIndex, Userindex, 0, "||Necesitas 10000 Almas para mejorar tu item." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If
        
    End If
    
    'Eze: mejorar items Casco
    If UCase$(rdata) = "/CONSTRUIR5" Then
            
        If UserList(Userindex).Invent.CascoEqpObjIndex > 0 Then
            Call SendData(ToIndex, Userindex, 0, "||Debes desequipar el casco o sombrero para poder mejorarla." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If
            
        If Not MeterItemEnInventario(Userindex, Arzhnnsz) Then
            Call SendData(ToIndex, Userindex, 0, "||No tienes suficiente espacio en el inventario." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If

        'If Not TieneObjetos(1379, 1, Userindex) Or Not TieneObjetos(1387, 5, Userindex) Or Not TieneObjetos(1388, 5, Userindex) Or Not TieneObjetos(1389, 5, Userindex) Then
        ' Call SendData(ToIndex, Userindex, 0, "||No tienes algunos de los requisitos para construir este objeto." & "´" & FontTypeNames.FONTTYPE_INFO)
        'Exit Sub
        ' End If
        If TieneObjetos(1159, 1, Userindex) And TieneObjetos(1500, 2000, Userindex) Then

            Arzhnnsz.Amount = 1
            Arzhnnsz.ObjIndex = 1470
            Call MeterItemEnInventario(Userindex, Arzhnnsz)
            Call SendData(ToIndex, Userindex, 0, "||Felicitaciones, has mejorado tu Armadura" & "´" & FontTypeNames.FONTTYPE_INFO)
            Call QuitarObjetos(1159, 1, Userindex)
            Call QuitarObjetos(1500, 2000, Userindex)
            Exit Sub
        ElseIf TieneObjetos(1159, 1, Userindex) Then
            Call SendData(ToIndex, Userindex, 0, "||Necesitas 2000 Almas para mejorar tu item." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If
        
        If TieneObjetos(1355, 1, Userindex) And TieneObjetos(1500, 2000, Userindex) Then

            Arzhnnsz.Amount = 1
            Arzhnnsz.ObjIndex = 1473
            Call MeterItemEnInventario(Userindex, Arzhnnsz)
            Call SendData(ToIndex, Userindex, 0, "||Felicitaciones, has mejorado tu Armadura" & "´" & FontTypeNames.FONTTYPE_INFO)
            Call QuitarObjetos(1355, 1, Userindex)
            Call QuitarObjetos(1500, 2000, Userindex)
            Exit Sub
        ElseIf TieneObjetos(1355, 1, Userindex) Then
            Call SendData(ToIndex, Userindex, 0, "||Necesitas 2000 Almas para mejorar tu item." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If
        
        If TieneObjetos(1356, 1, Userindex) And TieneObjetos(1500, 2000, Userindex) Then

            Arzhnnsz.Amount = 1
            Arzhnnsz.ObjIndex = 1476
            Call MeterItemEnInventario(Userindex, Arzhnnsz)
            Call SendData(ToIndex, Userindex, 0, "||Felicitaciones, has mejorado tu Armadura" & "´" & FontTypeNames.FONTTYPE_INFO)
            Call QuitarObjetos(1356, 1, Userindex)
            Call QuitarObjetos(1500, 2000, Userindex)
            Exit Sub
        ElseIf TieneObjetos(1356, 1, Userindex) Then
            Call SendData(ToIndex, Userindex, 0, "||Necesitas 2000 Almas para mejorar tu item." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If
        
        If TieneObjetos(1364, 1, Userindex) And TieneObjetos(1500, 2000, Userindex) Then

            Arzhnnsz.Amount = 1
            Arzhnnsz.ObjIndex = 1479
            Call MeterItemEnInventario(Userindex, Arzhnnsz)
            Call SendData(ToIndex, Userindex, 0, "||Felicitaciones, has mejorado tu Armadura" & "´" & FontTypeNames.FONTTYPE_INFO)
            Call QuitarObjetos(1364, 1, Userindex)
            Call QuitarObjetos(1500, 2000, Userindex)
            Exit Sub
        ElseIf TieneObjetos(1364, 1, Userindex) Then
            Call SendData(ToIndex, Userindex, 0, "||Necesitas 2000 Almas para mejorar tu item." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If
        
        If TieneObjetos(1365, 1, Userindex) And TieneObjetos(1500, 2000, Userindex) Then

            Arzhnnsz.Amount = 1
            Arzhnnsz.ObjIndex = 1482
            Call MeterItemEnInventario(Userindex, Arzhnnsz)
            Call SendData(ToIndex, Userindex, 0, "||Felicitaciones, has mejorado tu Armadura" & "´" & FontTypeNames.FONTTYPE_INFO)
            Call QuitarObjetos(1365, 1, Userindex)
            Call QuitarObjetos(1500, 2000, Userindex)
            Exit Sub
        ElseIf TieneObjetos(1365, 1, Userindex) Then
            Call SendData(ToIndex, Userindex, 0, "||Necesitas 2000 Almas para mejorar tu item." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If
        
        If TieneObjetos(1366, 1, Userindex) And TieneObjetos(1500, 2000, Userindex) Then

            Arzhnnsz.Amount = 1
            Arzhnnsz.ObjIndex = 1485
            Call MeterItemEnInventario(Userindex, Arzhnnsz)
            Call SendData(ToIndex, Userindex, 0, "||Felicitaciones, has mejorado tu Armadura" & "´" & FontTypeNames.FONTTYPE_INFO)
            Call QuitarObjetos(1366, 1, Userindex)
            Call QuitarObjetos(1500, 2000, Userindex)
            Exit Sub
        ElseIf TieneObjetos(1366, 1, Userindex) Then
            Call SendData(ToIndex, Userindex, 0, "||Necesitas 2000 Almas para mejorar tu item." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If
        
        If TieneObjetos(1367, 1, Userindex) And TieneObjetos(1500, 2000, Userindex) Then

            Arzhnnsz.Amount = 1
            Arzhnnsz.ObjIndex = 1488
            Call MeterItemEnInventario(Userindex, Arzhnnsz)
            Call SendData(ToIndex, Userindex, 0, "||Felicitaciones, has mejorado tu Armadura" & "´" & FontTypeNames.FONTTYPE_INFO)
            Call QuitarObjetos(1367, 1, Userindex)
            Call QuitarObjetos(1500, 2000, Userindex)
            Exit Sub
        ElseIf TieneObjetos(1367, 1, Userindex) Then
            Call SendData(ToIndex, Userindex, 0, "||Necesitas 2000 Almas para mejorar tu item." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If
        
        If TieneObjetos(1368, 1, Userindex) And TieneObjetos(1500, 2000, Userindex) Then

            Arzhnnsz.Amount = 1
            Arzhnnsz.ObjIndex = 1491
            Call MeterItemEnInventario(Userindex, Arzhnnsz)
            Call SendData(ToIndex, Userindex, 0, "||Felicitaciones, has mejorado tu Armadura" & "´" & FontTypeNames.FONTTYPE_INFO)
            Call QuitarObjetos(1368, 1, Userindex)
            Call QuitarObjetos(1500, 2000, Userindex)
            Exit Sub
        ElseIf TieneObjetos(1368, 1, Userindex) Then
            Call SendData(ToIndex, Userindex, 0, "||Necesitas 2000 Almas para mejorar tu item." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If
        
        If TieneObjetos(1470, 1, Userindex) And TieneObjetos(1500, 6000, Userindex) Then

            Arzhnnsz.Amount = 1
            Arzhnnsz.ObjIndex = 1471
            Call MeterItemEnInventario(Userindex, Arzhnnsz)
            Call SendData(ToIndex, Userindex, 0, "||Felicitaciones, has mejorado tu Armadura" & "´" & FontTypeNames.FONTTYPE_INFO)
            Call QuitarObjetos(1470, 1, Userindex)
            Call QuitarObjetos(1500, 6000, Userindex)
            Exit Sub
        ElseIf TieneObjetos(1470, 1, Userindex) Then
            Call SendData(ToIndex, Userindex, 0, "||Necesitas 6000 Almas para mejorar tu item." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If
        
        If TieneObjetos(1473, 1, Userindex) And TieneObjetos(1500, 6000, Userindex) Then

            Arzhnnsz.Amount = 1
            Arzhnnsz.ObjIndex = 1474
            Call MeterItemEnInventario(Userindex, Arzhnnsz)
            Call SendData(ToIndex, Userindex, 0, "||Felicitaciones, has mejorado tu Armadura" & "´" & FontTypeNames.FONTTYPE_INFO)
            Call QuitarObjetos(1473, 1, Userindex)
            Call QuitarObjetos(1500, 6000, Userindex)
            Exit Sub
        ElseIf TieneObjetos(1473, 1, Userindex) Then
            Call SendData(ToIndex, Userindex, 0, "||Necesitas 6000 Almas para mejorar tu item." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If
        
        If TieneObjetos(1476, 1, Userindex) And TieneObjetos(1500, 6000, Userindex) Then

            Arzhnnsz.Amount = 1
            Arzhnnsz.ObjIndex = 1477
            Call MeterItemEnInventario(Userindex, Arzhnnsz)
            Call SendData(ToIndex, Userindex, 0, "||Felicitaciones, has mejorado tu Armadura" & "´" & FontTypeNames.FONTTYPE_INFO)
            Call QuitarObjetos(1476, 1, Userindex)
            Call QuitarObjetos(1500, 6000, Userindex)
            Exit Sub
        ElseIf TieneObjetos(1476, 1, Userindex) Then
            Call SendData(ToIndex, Userindex, 0, "||Necesitas 6000 Almas para mejorar tu item." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If
        
        If TieneObjetos(1479, 1, Userindex) And TieneObjetos(1500, 6000, Userindex) Then

            Arzhnnsz.Amount = 1
            Arzhnnsz.ObjIndex = 1480
            Call MeterItemEnInventario(Userindex, Arzhnnsz)
            Call SendData(ToIndex, Userindex, 0, "||Felicitaciones, has mejorado tu Armadura" & "´" & FontTypeNames.FONTTYPE_INFO)
            Call QuitarObjetos(1479, 1, Userindex)
            Call QuitarObjetos(1500, 6000, Userindex)
            Exit Sub
        ElseIf TieneObjetos(1479, 1, Userindex) Then
            Call SendData(ToIndex, Userindex, 0, "||Necesitas 6000 Almas para mejorar tu item." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If
        
        If TieneObjetos(1482, 1, Userindex) And TieneObjetos(1500, 6000, Userindex) Then

            Arzhnnsz.Amount = 1
            Arzhnnsz.ObjIndex = 1483
            Call MeterItemEnInventario(Userindex, Arzhnnsz)
            Call SendData(ToIndex, Userindex, 0, "||Felicitaciones, has mejorado tu Armadura" & "´" & FontTypeNames.FONTTYPE_INFO)
            Call QuitarObjetos(1482, 1, Userindex)
            Call QuitarObjetos(1500, 6000, Userindex)
            Exit Sub
        ElseIf TieneObjetos(1482, 1, Userindex) Then
            Call SendData(ToIndex, Userindex, 0, "||Necesitas 6000 Almas para mejorar tu item." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If
        
        If TieneObjetos(1485, 1, Userindex) And TieneObjetos(1500, 6000, Userindex) Then

            Arzhnnsz.Amount = 1
            Arzhnnsz.ObjIndex = 1486
            Call MeterItemEnInventario(Userindex, Arzhnnsz)
            Call SendData(ToIndex, Userindex, 0, "||Felicitaciones, has mejorado tu Armadura" & "´" & FontTypeNames.FONTTYPE_INFO)
            Call QuitarObjetos(1485, 1, Userindex)
            Call QuitarObjetos(1500, 6000, Userindex)
            Exit Sub
        ElseIf TieneObjetos(1485, 1, Userindex) Then
            Call SendData(ToIndex, Userindex, 0, "||Necesitas 6000 Almas para mejorar tu item." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If
        
        If TieneObjetos(1488, 1, Userindex) And TieneObjetos(1500, 6000, Userindex) Then

            Arzhnnsz.Amount = 1
            Arzhnnsz.ObjIndex = 1489
            Call MeterItemEnInventario(Userindex, Arzhnnsz)
            Call SendData(ToIndex, Userindex, 0, "||Felicitaciones, has mejorado tu Armadura" & "´" & FontTypeNames.FONTTYPE_INFO)
            Call QuitarObjetos(1488, 1, Userindex)
            Call QuitarObjetos(1500, 6000, Userindex)
            Exit Sub
        ElseIf TieneObjetos(1488, 1, Userindex) Then
            Call SendData(ToIndex, Userindex, 0, "||Necesitas 6000 Almas para mejorar tu item." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If
        
        If TieneObjetos(1491, 1, Userindex) And TieneObjetos(1500, 6000, Userindex) Then

            Arzhnnsz.Amount = 1
            Arzhnnsz.ObjIndex = 1492
            Call MeterItemEnInventario(Userindex, Arzhnnsz)
            Call SendData(ToIndex, Userindex, 0, "||Felicitaciones, has mejorado tu Armadura" & "´" & FontTypeNames.FONTTYPE_INFO)
            Call QuitarObjetos(1491, 1, Userindex)
            Call QuitarObjetos(1500, 6000, Userindex)
            Exit Sub
        ElseIf TieneObjetos(1491, 1, Userindex) Then
            Call SendData(ToIndex, Userindex, 0, "||Necesitas 6000 Almas para mejorar tu item." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If
        
        If TieneObjetos(1471, 1, Userindex) And TieneObjetos(1500, 10000, Userindex) Then

            Arzhnnsz.Amount = 1
            Arzhnnsz.ObjIndex = 1472
            Call MeterItemEnInventario(Userindex, Arzhnnsz)
            Call SendData(ToIndex, Userindex, 0, "||Felicitaciones, has mejorado tu Armadura" & "´" & FontTypeNames.FONTTYPE_INFO)
            Call QuitarObjetos(1471, 1, Userindex)
            Call QuitarObjetos(1500, 10000, Userindex)
            Exit Sub
        ElseIf TieneObjetos(1471, 1, Userindex) Then
            Call SendData(ToIndex, Userindex, 0, "||Necesitas 10000 Almas para mejorar tu item." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If
        
        If TieneObjetos(1474, 1, Userindex) And TieneObjetos(1500, 10000, Userindex) Then

            Arzhnnsz.Amount = 1
            Arzhnnsz.ObjIndex = 1475
            Call MeterItemEnInventario(Userindex, Arzhnnsz)
            Call SendData(ToIndex, Userindex, 0, "||Felicitaciones, has mejorado tu Armadura" & "´" & FontTypeNames.FONTTYPE_INFO)
            Call QuitarObjetos(1474, 1, Userindex)
            Call QuitarObjetos(1500, 10000, Userindex)
            Exit Sub
        ElseIf TieneObjetos(1474, 1, Userindex) Then
            Call SendData(ToIndex, Userindex, 0, "||Necesitas 10000 Almas para mejorar tu item." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If
        
        If TieneObjetos(1477, 1, Userindex) And TieneObjetos(1500, 10000, Userindex) Then

            Arzhnnsz.Amount = 1
            Arzhnnsz.ObjIndex = 1478
            Call MeterItemEnInventario(Userindex, Arzhnnsz)
            Call SendData(ToIndex, Userindex, 0, "||Felicitaciones, has mejorado tu Armadura" & "´" & FontTypeNames.FONTTYPE_INFO)
            Call QuitarObjetos(1477, 1, Userindex)
            Call QuitarObjetos(1500, 10000, Userindex)
            Exit Sub
        ElseIf TieneObjetos(1477, 1, Userindex) Then
            Call SendData(ToIndex, Userindex, 0, "||Necesitas 10000 Almas para mejorar tu item." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If
        
        If TieneObjetos(1480, 1, Userindex) And TieneObjetos(1500, 10000, Userindex) Then

            Arzhnnsz.Amount = 1
            Arzhnnsz.ObjIndex = 1481
            Call MeterItemEnInventario(Userindex, Arzhnnsz)
            Call SendData(ToIndex, Userindex, 0, "||Felicitaciones, has mejorado tu Armadura" & "´" & FontTypeNames.FONTTYPE_INFO)
            Call QuitarObjetos(1480, 1, Userindex)
            Call QuitarObjetos(1500, 10000, Userindex)
            Exit Sub
        ElseIf TieneObjetos(1480, 1, Userindex) Then
            Call SendData(ToIndex, Userindex, 0, "||Necesitas 10000 Almas para mejorar tu item." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If
        
        If TieneObjetos(1483, 1, Userindex) And TieneObjetos(1500, 10000, Userindex) Then

            Arzhnnsz.Amount = 1
            Arzhnnsz.ObjIndex = 1484
            Call MeterItemEnInventario(Userindex, Arzhnnsz)
            Call SendData(ToIndex, Userindex, 0, "||Felicitaciones, has mejorado tu Armadura" & "´" & FontTypeNames.FONTTYPE_INFO)
            Call QuitarObjetos(1483, 1, Userindex)
            Call QuitarObjetos(1500, 10000, Userindex)
            Exit Sub
        ElseIf TieneObjetos(1483, 1, Userindex) Then
            Call SendData(ToIndex, Userindex, 0, "||Necesitas 10000 Almas para mejorar tu item." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If
        
        If TieneObjetos(1486, 1, Userindex) And TieneObjetos(1500, 10000, Userindex) Then

            Arzhnnsz.Amount = 1
            Arzhnnsz.ObjIndex = 1487
            Call MeterItemEnInventario(Userindex, Arzhnnsz)
            Call SendData(ToIndex, Userindex, 0, "||Felicitaciones, has mejorado tu Armadura" & "´" & FontTypeNames.FONTTYPE_INFO)
            Call QuitarObjetos(1486, 1, Userindex)
            Call QuitarObjetos(1500, 10000, Userindex)
            Exit Sub
        ElseIf TieneObjetos(1486, 1, Userindex) Then
            Call SendData(ToIndex, Userindex, 0, "||Necesitas 10000 Almas para mejorar tu item." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If
        
        If TieneObjetos(1489, 1, Userindex) And TieneObjetos(1500, 10000, Userindex) Then

            Arzhnnsz.Amount = 1
            Arzhnnsz.ObjIndex = 1490
            Call MeterItemEnInventario(Userindex, Arzhnnsz)
            Call SendData(ToIndex, Userindex, 0, "||Felicitaciones, has mejorado tu Armadura" & "´" & FontTypeNames.FONTTYPE_INFO)
            Call QuitarObjetos(1489, 1, Userindex)
            Call QuitarObjetos(1500, 10000, Userindex)
            Exit Sub
        ElseIf TieneObjetos(1489, 1, Userindex) Then
            Call SendData(ToIndex, Userindex, 0, "||Necesitas 10000 Almas para mejorar tu item." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If
        
        If TieneObjetos(1492, 1, Userindex) And TieneObjetos(1500, 10000, Userindex) Then

            Arzhnnsz.Amount = 1
            Arzhnnsz.ObjIndex = 1493
            Call MeterItemEnInventario(Userindex, Arzhnnsz)
            Call SendData(ToIndex, Userindex, 0, "||Felicitaciones, has mejorado tu Armadura" & "´" & FontTypeNames.FONTTYPE_INFO)
            Call QuitarObjetos(1492, 1, Userindex)
            Call QuitarObjetos(1500, 10000, Userindex)
            Exit Sub
        ElseIf TieneObjetos(1492, 1, Userindex) Then
            Call SendData(ToIndex, Userindex, 0, "||Necesitas 10000 Almas para mejorar tu item." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If
        
    End If

    'Eze: mejorar items Escudo / Anillo
    If UCase$(rdata) = "/CONSTRUIR6" Then

        If UserList(Userindex).Invent.EscudoEqpObjIndex > 0 Then
            Call SendData(ToIndex, Userindex, 0, "||Debes desequipar el escudo para poder mejorarla." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If
        
        If UserList(Userindex).Invent.AnilloEqpObjIndex > 0 Then
            Call SendData(ToIndex, Userindex, 0, "||Debes desequipar el anillo para poder mejorarla." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If
                
        If Not MeterItemEnInventario(Userindex, Arzhnnsz) Then
            Call SendData(ToIndex, Userindex, 0, "||No tienes suficiente espacio en el inventario." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If

        'If Not TieneObjetos(1379, 1, Userindex) Or Not TieneObjetos(1387, 5, Userindex) Or Not TieneObjetos(1388, 5, Userindex) Or Not TieneObjetos(1389, 5, Userindex) Then
        'Call SendData(ToIndex, Userindex, 0, "||No tienes algunos de los requisitos para construir este objeto." & "´" & FontTypeNames.FONTTYPE_INFO)
        'Exit Sub
        'End If
        If TieneObjetos(1256, 1, Userindex) And TieneObjetos(1500, 2000, Userindex) Then

            Arzhnnsz.Amount = 1
            Arzhnnsz.ObjIndex = 1446
            Call MeterItemEnInventario(Userindex, Arzhnnsz)
            Call SendData(ToIndex, Userindex, 0, "||Felicitaciones, has mejorado tu Armadura" & "´" & FontTypeNames.FONTTYPE_INFO)
            Call QuitarObjetos(1256, 1, Userindex)
            Call QuitarObjetos(1500, 2000, Userindex)
            Exit Sub
        ElseIf TieneObjetos(1256, 1, Userindex) Then
            Call SendData(ToIndex, Userindex, 0, "||Necesitas 2000 Almas para mejorar tu item." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If
        
        If TieneObjetos(1357, 1, Userindex) And TieneObjetos(1500, 2000, Userindex) Then

            Arzhnnsz.Amount = 1
            Arzhnnsz.ObjIndex = 1449
            Call MeterItemEnInventario(Userindex, Arzhnnsz)
            Call SendData(ToIndex, Userindex, 0, "||Felicitaciones, has mejorado tu Armadura" & "´" & FontTypeNames.FONTTYPE_INFO)
            Call QuitarObjetos(1357, 1, Userindex)
            Call QuitarObjetos(1500, 2000, Userindex)
            Exit Sub
        ElseIf TieneObjetos(1357, 1, Userindex) Then
            Call SendData(ToIndex, Userindex, 0, "||Necesitas 2000 Almas para mejorar tu item." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If
        
        If TieneObjetos(1358, 1, Userindex) And TieneObjetos(1500, 2000, Userindex) Then

            Arzhnnsz.Amount = 1
            Arzhnnsz.ObjIndex = 1452
            Call MeterItemEnInventario(Userindex, Arzhnnsz)
            Call SendData(ToIndex, Userindex, 0, "||Felicitaciones, has mejorado tu Armadura" & "´" & FontTypeNames.FONTTYPE_INFO)
            Call QuitarObjetos(1358, 1, Userindex)
            Call QuitarObjetos(1500, 2000, Userindex)
            Exit Sub
        ElseIf TieneObjetos(1358, 1, Userindex) Then
            Call SendData(ToIndex, Userindex, 0, "||Necesitas 2000 Almas para mejorar tu item." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If
        
        If TieneObjetos(1359, 1, Userindex) And TieneObjetos(1500, 2000, Userindex) Then

            Arzhnnsz.Amount = 1
            Arzhnnsz.ObjIndex = 1455
            Call MeterItemEnInventario(Userindex, Arzhnnsz)
            Call SendData(ToIndex, Userindex, 0, "||Felicitaciones, has mejorado tu Armadura" & "´" & FontTypeNames.FONTTYPE_INFO)
            Call QuitarObjetos(1359, 1, Userindex)
            Call QuitarObjetos(1500, 2000, Userindex)
            Exit Sub
        ElseIf TieneObjetos(1359, 1, Userindex) Then
            Call SendData(ToIndex, Userindex, 0, "||Necesitas 2000 Almas para mejorar tu item." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If
        
        If TieneObjetos(1360, 1, Userindex) And TieneObjetos(1500, 2000, Userindex) Then

            Arzhnnsz.Amount = 1
            Arzhnnsz.ObjIndex = 1458
            Call MeterItemEnInventario(Userindex, Arzhnnsz)
            Call SendData(ToIndex, Userindex, 0, "||Felicitaciones, has mejorado tu Armadura" & "´" & FontTypeNames.FONTTYPE_INFO)
            Call QuitarObjetos(1360, 1, Userindex)
            Call QuitarObjetos(1500, 2000, Userindex)
            Exit Sub
        ElseIf TieneObjetos(1360, 1, Userindex) Then
            Call SendData(ToIndex, Userindex, 0, "||Necesitas 2000 Almas para mejorar tu item." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If
        
        If TieneObjetos(1361, 1, Userindex) And TieneObjetos(1500, 2000, Userindex) Then

            Arzhnnsz.Amount = 1
            Arzhnnsz.ObjIndex = 1461
            Call MeterItemEnInventario(Userindex, Arzhnnsz)
            Call SendData(ToIndex, Userindex, 0, "||Felicitaciones, has mejorado tu Armadura" & "´" & FontTypeNames.FONTTYPE_INFO)
            Call QuitarObjetos(1361, 1, Userindex)
            Call QuitarObjetos(1500, 2000, Userindex)
            Exit Sub
        ElseIf TieneObjetos(1361, 1, Userindex) Then
            Call SendData(ToIndex, Userindex, 0, "||Necesitas 2000 Almas para mejorar tu item." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If
        
        If TieneObjetos(1362, 1, Userindex) And TieneObjetos(1500, 2000, Userindex) Then

            Arzhnnsz.Amount = 1
            Arzhnnsz.ObjIndex = 1464
            Call MeterItemEnInventario(Userindex, Arzhnnsz)
            Call SendData(ToIndex, Userindex, 0, "||Felicitaciones, has mejorado tu Armadura" & "´" & FontTypeNames.FONTTYPE_INFO)
            Call QuitarObjetos(1362, 1, Userindex)
            Call QuitarObjetos(1500, 2000, Userindex)
            Exit Sub
        ElseIf TieneObjetos(1362, 1, Userindex) Then
            Call SendData(ToIndex, Userindex, 0, "||Necesitas 2000 Almas para mejorar tu item." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If
        
        If TieneObjetos(1363, 1, Userindex) And TieneObjetos(1500, 2000, Userindex) Then

            Arzhnnsz.Amount = 1
            Arzhnnsz.ObjIndex = 1467
            Call MeterItemEnInventario(Userindex, Arzhnnsz)
            Call SendData(ToIndex, Userindex, 0, "||Felicitaciones, has mejorado tu Armadura" & "´" & FontTypeNames.FONTTYPE_INFO)
            Call QuitarObjetos(1363, 1, Userindex)
            Call QuitarObjetos(1500, 2000, Userindex)
            Exit Sub
        ElseIf TieneObjetos(1363, 1, Userindex) Then
            Call SendData(ToIndex, Userindex, 0, "||Necesitas 2000 Almas para mejorar tu item." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If
        
        If TieneObjetos(1446, 1, Userindex) And TieneObjetos(1500, 6000, Userindex) Then

            Arzhnnsz.Amount = 1
            Arzhnnsz.ObjIndex = 1447
            Call MeterItemEnInventario(Userindex, Arzhnnsz)
            Call SendData(ToIndex, Userindex, 0, "||Felicitaciones, has mejorado tu Armadura" & "´" & FontTypeNames.FONTTYPE_INFO)
            Call QuitarObjetos(1446, 1, Userindex)
            Call QuitarObjetos(1500, 6000, Userindex)
            Exit Sub
        ElseIf TieneObjetos(1446, 1, Userindex) Then
            Call SendData(ToIndex, Userindex, 0, "||Necesitas 6000 Almas para mejorar tu item." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If
        
        If TieneObjetos(1449, 1, Userindex) And TieneObjetos(1500, 6000, Userindex) Then

            Arzhnnsz.Amount = 1
            Arzhnnsz.ObjIndex = 1450
            Call MeterItemEnInventario(Userindex, Arzhnnsz)
            Call SendData(ToIndex, Userindex, 0, "||Felicitaciones, has mejorado tu Armadura" & "´" & FontTypeNames.FONTTYPE_INFO)
            Call QuitarObjetos(1449, 1, Userindex)
            Call QuitarObjetos(1500, 6000, Userindex)
            Exit Sub
        ElseIf TieneObjetos(1449, 1, Userindex) Then
            Call SendData(ToIndex, Userindex, 0, "||Necesitas 6000 Almas para mejorar tu item." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If
        
        If TieneObjetos(1452, 1, Userindex) And TieneObjetos(1500, 6000, Userindex) Then

            Arzhnnsz.Amount = 1
            Arzhnnsz.ObjIndex = 1453
            Call MeterItemEnInventario(Userindex, Arzhnnsz)
            Call SendData(ToIndex, Userindex, 0, "||Felicitaciones, has mejorado tu Armadura" & "´" & FontTypeNames.FONTTYPE_INFO)
            Call QuitarObjetos(1452, 1, Userindex)
            Call QuitarObjetos(1500, 6000, Userindex)
            Exit Sub
        ElseIf TieneObjetos(1452, 1, Userindex) Then
            Call SendData(ToIndex, Userindex, 0, "||Necesitas 6000 Almas para mejorar tu item." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If
        
        If TieneObjetos(1455, 1, Userindex) And TieneObjetos(1500, 6000, Userindex) Then

            Arzhnnsz.Amount = 1
            Arzhnnsz.ObjIndex = 1456
            Call MeterItemEnInventario(Userindex, Arzhnnsz)
            Call SendData(ToIndex, Userindex, 0, "||Felicitaciones, has mejorado tu Armadura" & "´" & FontTypeNames.FONTTYPE_INFO)
            Call QuitarObjetos(1455, 1, Userindex)
            Call QuitarObjetos(1500, 6000, Userindex)
            Exit Sub
        ElseIf TieneObjetos(1455, 1, Userindex) Then
            Call SendData(ToIndex, Userindex, 0, "||Necesitas 6000 Almas para mejorar tu item." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If
        
        If TieneObjetos(1458, 1, Userindex) And TieneObjetos(1500, 6000, Userindex) Then

            Arzhnnsz.Amount = 1
            Arzhnnsz.ObjIndex = 1459
            Call MeterItemEnInventario(Userindex, Arzhnnsz)
            Call SendData(ToIndex, Userindex, 0, "||Felicitaciones, has mejorado tu Armadura" & "´" & FontTypeNames.FONTTYPE_INFO)
            Call QuitarObjetos(1458, 1, Userindex)
            Call QuitarObjetos(1500, 6000, Userindex)
            Exit Sub
        ElseIf TieneObjetos(1458, 1, Userindex) Then
            Call SendData(ToIndex, Userindex, 0, "||Necesitas 6000 Almas para mejorar tu item." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If
        
        If TieneObjetos(1461, 1, Userindex) And TieneObjetos(1500, 6000, Userindex) Then

            Arzhnnsz.Amount = 1
            Arzhnnsz.ObjIndex = 1462
            Call MeterItemEnInventario(Userindex, Arzhnnsz)
            Call SendData(ToIndex, Userindex, 0, "||Felicitaciones, has mejorado tu Armadura" & "´" & FontTypeNames.FONTTYPE_INFO)
            Call QuitarObjetos(1461, 1, Userindex)
            Call QuitarObjetos(1500, 6000, Userindex)
            Exit Sub
        ElseIf TieneObjetos(1461, 1, Userindex) Then
            Call SendData(ToIndex, Userindex, 0, "||Necesitas 6000 Almas para mejorar tu item." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If
        
        If TieneObjetos(1464, 1, Userindex) And TieneObjetos(1500, 6000, Userindex) Then

            Arzhnnsz.Amount = 1
            Arzhnnsz.ObjIndex = 1465
            Call MeterItemEnInventario(Userindex, Arzhnnsz)
            Call SendData(ToIndex, Userindex, 0, "||Felicitaciones, has mejorado tu Armadura" & "´" & FontTypeNames.FONTTYPE_INFO)
            Call QuitarObjetos(1464, 1, Userindex)
            Call QuitarObjetos(1500, 6000, Userindex)
            Exit Sub
        ElseIf TieneObjetos(1464, 1, Userindex) Then
            Call SendData(ToIndex, Userindex, 0, "||Necesitas 6000 Almas para mejorar tu item." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If
        
        If TieneObjetos(1467, 1, Userindex) And TieneObjetos(1500, 6000, Userindex) Then

            Arzhnnsz.Amount = 1
            Arzhnnsz.ObjIndex = 1468
            Call MeterItemEnInventario(Userindex, Arzhnnsz)
            Call SendData(ToIndex, Userindex, 0, "||Felicitaciones, has mejorado tu Armadura" & "´" & FontTypeNames.FONTTYPE_INFO)
            Call QuitarObjetos(1467, 1, Userindex)
            Call QuitarObjetos(1500, 6000, Userindex)
            Exit Sub
        ElseIf TieneObjetos(1467, 1, Userindex) Then
            Call SendData(ToIndex, Userindex, 0, "||Necesitas 6000 Almas para mejorar tu item." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If
        
        If TieneObjetos(1447, 1, Userindex) And TieneObjetos(1500, 10000, Userindex) Then

            Arzhnnsz.Amount = 1
            Arzhnnsz.ObjIndex = 1448
            Call MeterItemEnInventario(Userindex, Arzhnnsz)
            Call SendData(ToIndex, Userindex, 0, "||Felicitaciones, has mejorado tu Armadura" & "´" & FontTypeNames.FONTTYPE_INFO)
            Call QuitarObjetos(1447, 1, Userindex)
            Call QuitarObjetos(1500, 10000, Userindex)
            Exit Sub
        ElseIf TieneObjetos(1447, 1, Userindex) Then
            Call SendData(ToIndex, Userindex, 0, "||Necesitas 10000 Almas para mejorar tu item." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If
        
        If TieneObjetos(1450, 1, Userindex) And TieneObjetos(1500, 10000, Userindex) Then

            Arzhnnsz.Amount = 1
            Arzhnnsz.ObjIndex = 1451
            Call MeterItemEnInventario(Userindex, Arzhnnsz)
            Call SendData(ToIndex, Userindex, 0, "||Felicitaciones, has mejorado tu Armadura" & "´" & FontTypeNames.FONTTYPE_INFO)
            Call QuitarObjetos(1450, 1, Userindex)
            Call QuitarObjetos(1500, 10000, Userindex)
            Exit Sub
        ElseIf TieneObjetos(1450, 1, Userindex) Then
            Call SendData(ToIndex, Userindex, 0, "||Necesitas 10000 Almas para mejorar tu item." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If
        
        If TieneObjetos(1453, 1, Userindex) And TieneObjetos(1500, 10000, Userindex) Then

            Arzhnnsz.Amount = 1
            Arzhnnsz.ObjIndex = 1454
            Call MeterItemEnInventario(Userindex, Arzhnnsz)
            Call SendData(ToIndex, Userindex, 0, "||Felicitaciones, has mejorado tu Armadura" & "´" & FontTypeNames.FONTTYPE_INFO)
            Call QuitarObjetos(1453, 1, Userindex)
            Call QuitarObjetos(1500, 10000, Userindex)
            Exit Sub
        ElseIf TieneObjetos(1453, 1, Userindex) Then
            Call SendData(ToIndex, Userindex, 0, "||Necesitas 10000 Almas para mejorar tu item." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If
        
        If TieneObjetos(1456, 1, Userindex) And TieneObjetos(1500, 10000, Userindex) Then

            Arzhnnsz.Amount = 1
            Arzhnnsz.ObjIndex = 1457
            Call MeterItemEnInventario(Userindex, Arzhnnsz)
            Call SendData(ToIndex, Userindex, 0, "||Felicitaciones, has mejorado tu Armadura" & "´" & FontTypeNames.FONTTYPE_INFO)
            Call QuitarObjetos(1456, 1, Userindex)
            Call QuitarObjetos(1500, 10000, Userindex)
            Exit Sub
        ElseIf TieneObjetos(1456, 1, Userindex) Then
            Call SendData(ToIndex, Userindex, 0, "||Necesitas 10000 Almas para mejorar tu item." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If
        
        If TieneObjetos(1459, 1, Userindex) And TieneObjetos(1500, 10000, Userindex) Then

            Arzhnnsz.Amount = 1
            Arzhnnsz.ObjIndex = 1460
            Call MeterItemEnInventario(Userindex, Arzhnnsz)
            Call SendData(ToIndex, Userindex, 0, "||Felicitaciones, has mejorado tu Armadura" & "´" & FontTypeNames.FONTTYPE_INFO)
            Call QuitarObjetos(1459, 1, Userindex)
            Call QuitarObjetos(1500, 10000, Userindex)
            Exit Sub
        ElseIf TieneObjetos(1459, 1, Userindex) Then
            Call SendData(ToIndex, Userindex, 0, "||Necesitas 10000 Almas para mejorar tu item." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If
        
        If TieneObjetos(1462, 1, Userindex) And TieneObjetos(1500, 10000, Userindex) Then

            Arzhnnsz.Amount = 1
            Arzhnnsz.ObjIndex = 1463
            Call MeterItemEnInventario(Userindex, Arzhnnsz)
            Call SendData(ToIndex, Userindex, 0, "||Felicitaciones, has mejorado tu Armadura" & "´" & FontTypeNames.FONTTYPE_INFO)
            Call QuitarObjetos(1462, 1, Userindex)
            Call QuitarObjetos(1500, 10000, Userindex)
            Exit Sub
        ElseIf TieneObjetos(1462, 1, Userindex) Then
            Call SendData(ToIndex, Userindex, 0, "||Necesitas 10000 Almas para mejorar tu item." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If
        
        If TieneObjetos(1465, 1, Userindex) And TieneObjetos(1500, 10000, Userindex) Then

            Arzhnnsz.Amount = 1
            Arzhnnsz.ObjIndex = 1466
            Call MeterItemEnInventario(Userindex, Arzhnnsz)
            Call SendData(ToIndex, Userindex, 0, "||Felicitaciones, has mejorado tu Armadura" & "´" & FontTypeNames.FONTTYPE_INFO)
            Call QuitarObjetos(1465, 1, Userindex)
            Call QuitarObjetos(1500, 10000, Userindex)
            Exit Sub
        ElseIf TieneObjetos(1465, 1, Userindex) Then
            Call SendData(ToIndex, Userindex, 0, "||Necesitas 10000 Almas para mejorar tu item." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If
        
        If TieneObjetos(1468, 1, Userindex) And TieneObjetos(1500, 10000, Userindex) Then

            Arzhnnsz.Amount = 1
            Arzhnnsz.ObjIndex = 1469
            Call MeterItemEnInventario(Userindex, Arzhnnsz)
            Call SendData(ToIndex, Userindex, 0, "||Felicitaciones, has mejorado tu Armadura" & "´" & FontTypeNames.FONTTYPE_INFO)
            Call QuitarObjetos(1468, 1, Userindex)
            Call QuitarObjetos(1500, 10000, Userindex)
            Exit Sub
        ElseIf TieneObjetos(1468, 1, Userindex) Then
            Call SendData(ToIndex, Userindex, 0, "||Necesitas 10000 Almas para mejorar tu item." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If
            
    End If
    
    'Eze: mejorar Armadura
    If UCase$(rdata) = "/CONSTRUIR7" Then
                
        If UserList(Userindex).Invent.ArmourEqpObjIndex > 0 Then
            Call SendData(ToIndex, Userindex, 0, "||Debes desequipar tu armadura para poder mejorarla." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If
                
        If Not MeterItemEnInventario(Userindex, Arzhnnsz) Then
            Call SendData(ToIndex, Userindex, 0, "||No tienes suficiente espacio en el inventario." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If

        If TieneObjetos(1181, 1, Userindex) And TieneObjetos(1500, 2000, Userindex) Then

            Arzhnnsz.Amount = 1
            Arzhnnsz.ObjIndex = 1398
            Call MeterItemEnInventario(Userindex, Arzhnnsz)
            Call SendData(ToIndex, Userindex, 0, "||Felicitaciones, has mejorado tu Armadura" & "´" & FontTypeNames.FONTTYPE_INFO)
            Call QuitarObjetos(1181, 1, Userindex)
            Call QuitarObjetos(1500, 2000, Userindex)
            Exit Sub
        ElseIf TieneObjetos(1181, 1, Userindex) Then
            Call SendData(ToIndex, Userindex, 0, "||Necesitas 2000 Almas para mejorar tu item." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If
        
        If TieneObjetos(196, 1, Userindex) And TieneObjetos(1500, 2000, Userindex) Then

            Arzhnnsz.Amount = 1
            Arzhnnsz.ObjIndex = 1401
            Call MeterItemEnInventario(Userindex, Arzhnnsz)
            Call SendData(ToIndex, Userindex, 0, "||Felicitaciones, has mejorado tu Armadura" & "´" & FontTypeNames.FONTTYPE_INFO)
            Call QuitarObjetos(196, 1, Userindex)
            Call QuitarObjetos(1500, 2000, Userindex)
            Exit Sub
        ElseIf TieneObjetos(196, 1, Userindex) Then
            Call SendData(ToIndex, Userindex, 0, "||Necesitas 2000 Almas para mejorar tu item." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If
        
        If TieneObjetos(1341, 1, Userindex) And TieneObjetos(1500, 2000, Userindex) Then

            Arzhnnsz.Amount = 1
            Arzhnnsz.ObjIndex = 1404
            Call MeterItemEnInventario(Userindex, Arzhnnsz)
            Call SendData(ToIndex, Userindex, 0, "||Felicitaciones, has mejorado tu Armadura" & "´" & FontTypeNames.FONTTYPE_INFO)
            Call QuitarObjetos(1341, 1, Userindex)
            Call QuitarObjetos(1500, 2000, Userindex)
            Exit Sub
        ElseIf TieneObjetos(1341, 1, Userindex) Then
            Call SendData(ToIndex, Userindex, 0, "||Necesitas 2000 Almas para mejorar tu item." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If
        
        If TieneObjetos(1342, 1, Userindex) And TieneObjetos(1500, 2000, Userindex) Then

            Arzhnnsz.Amount = 1
            Arzhnnsz.ObjIndex = 1407
            Call MeterItemEnInventario(Userindex, Arzhnnsz)
            Call SendData(ToIndex, Userindex, 0, "||Felicitaciones, has mejorado tu Armadura" & "´" & FontTypeNames.FONTTYPE_INFO)
            Call QuitarObjetos(1342, 1, Userindex)
            Call QuitarObjetos(1500, 2000, Userindex)
            Exit Sub
        ElseIf TieneObjetos(1342, 1, Userindex) Then
            Call SendData(ToIndex, Userindex, 0, "||Necesitas 2000 Almas para mejorar tu item." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If
        
        If TieneObjetos(1343, 1, Userindex) And TieneObjetos(1500, 2000, Userindex) Then

            Arzhnnsz.Amount = 1
            Arzhnnsz.ObjIndex = 1410
            Call MeterItemEnInventario(Userindex, Arzhnnsz)
            Call SendData(ToIndex, Userindex, 0, "||Felicitaciones, has mejorado tu Armadura" & "´" & FontTypeNames.FONTTYPE_INFO)
            Call QuitarObjetos(1343, 1, Userindex)
            Call QuitarObjetos(1500, 2000, Userindex)
            Exit Sub
        ElseIf TieneObjetos(1343, 1, Userindex) Then
            Call SendData(ToIndex, Userindex, 0, "||Necesitas 2000 Almas para mejorar tu item." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If
        
        If TieneObjetos(1344, 1, Userindex) And TieneObjetos(1500, 2000, Userindex) Then

            Arzhnnsz.Amount = 1
            Arzhnnsz.ObjIndex = 1413
            Call MeterItemEnInventario(Userindex, Arzhnnsz)
            Call SendData(ToIndex, Userindex, 0, "||Felicitaciones, has mejorado tu Armadura" & "´" & FontTypeNames.FONTTYPE_INFO)
            Call QuitarObjetos(1344, 1, Userindex)
            Call QuitarObjetos(1500, 2000, Userindex)
            Exit Sub
        ElseIf TieneObjetos(1344, 1, Userindex) Then
            Call SendData(ToIndex, Userindex, 0, "||Necesitas 2000 Almas para mejorar tu item." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If
        
        If TieneObjetos(1345, 1, Userindex) And TieneObjetos(1500, 2000, Userindex) Then

            Arzhnnsz.Amount = 1
            Arzhnnsz.ObjIndex = 1416
            Call MeterItemEnInventario(Userindex, Arzhnnsz)
            Call SendData(ToIndex, Userindex, 0, "||Felicitaciones, has mejorado tu Armadura" & "´" & FontTypeNames.FONTTYPE_INFO)
            Call QuitarObjetos(1345, 1, Userindex)
            Call QuitarObjetos(1500, 2000, Userindex)
            Exit Sub
        ElseIf TieneObjetos(1345, 1, Userindex) Then
            Call SendData(ToIndex, Userindex, 0, "||Necesitas 2000 Almas para mejorar tu item." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If
        
        If TieneObjetos(1346, 1, Userindex) And TieneObjetos(1500, 2000, Userindex) Then

            Arzhnnsz.Amount = 1
            Arzhnnsz.ObjIndex = 1419
            Call MeterItemEnInventario(Userindex, Arzhnnsz)
            Call SendData(ToIndex, Userindex, 0, "||Felicitaciones, has mejorado tu Armadura" & "´" & FontTypeNames.FONTTYPE_INFO)
            Call QuitarObjetos(1346, 1, Userindex)
            Call QuitarObjetos(1500, 2000, Userindex)
            Exit Sub
        ElseIf TieneObjetos(1346, 1, Userindex) Then
            Call SendData(ToIndex, Userindex, 0, "||Necesitas 2000 Almas para mejorar tu item." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If
        
        If TieneObjetos(1347, 1, Userindex) And TieneObjetos(1500, 2000, Userindex) Then

            Arzhnnsz.Amount = 1
            Arzhnnsz.ObjIndex = 1422
            Call MeterItemEnInventario(Userindex, Arzhnnsz)
            Call SendData(ToIndex, Userindex, 0, "||Felicitaciones, has mejorado tu Armadura" & "´" & FontTypeNames.FONTTYPE_INFO)
            Call QuitarObjetos(1347, 1, Userindex)
            Call QuitarObjetos(1500, 2000, Userindex)
            Exit Sub
        ElseIf TieneObjetos(1347, 1, Userindex) Then
            Call SendData(ToIndex, Userindex, 0, "||Necesitas 2000 Almas para mejorar tu item." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If
        
        If TieneObjetos(1348, 1, Userindex) And TieneObjetos(1500, 2000, Userindex) Then

            Arzhnnsz.Amount = 1
            Arzhnnsz.ObjIndex = 1425
            Call MeterItemEnInventario(Userindex, Arzhnnsz)
            Call SendData(ToIndex, Userindex, 0, "||Felicitaciones, has mejorado tu Armadura" & "´" & FontTypeNames.FONTTYPE_INFO)
            Call QuitarObjetos(1348, 1, Userindex)
            Call QuitarObjetos(1500, 2000, Userindex)
            Exit Sub
        ElseIf TieneObjetos(1348, 1, Userindex) Then
            Call SendData(ToIndex, Userindex, 0, "||Necesitas 2000 Almas para mejorar tu item." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If
        
        If TieneObjetos(1349, 1, Userindex) And TieneObjetos(1500, 2000, Userindex) Then

            Arzhnnsz.Amount = 1
            Arzhnnsz.ObjIndex = 1428
            Call MeterItemEnInventario(Userindex, Arzhnnsz)
            Call SendData(ToIndex, Userindex, 0, "||Felicitaciones, has mejorado tu Armadura" & "´" & FontTypeNames.FONTTYPE_INFO)
            Call QuitarObjetos(1349, 1, Userindex)
            Call QuitarObjetos(1500, 2000, Userindex)
            Exit Sub
        ElseIf TieneObjetos(1349, 1, Userindex) Then
            Call SendData(ToIndex, Userindex, 0, "||Necesitas 2000 Almas para mejorar tu item." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If
        
        If TieneObjetos(1350, 1, Userindex) And TieneObjetos(1500, 2000, Userindex) Then

            Arzhnnsz.Amount = 1
            Arzhnnsz.ObjIndex = 1431
            Call MeterItemEnInventario(Userindex, Arzhnnsz)
            Call SendData(ToIndex, Userindex, 0, "||Felicitaciones, has mejorado tu Armadura" & "´" & FontTypeNames.FONTTYPE_INFO)
            Call QuitarObjetos(1350, 1, Userindex)
            Call QuitarObjetos(1500, 2000, Userindex)
            Exit Sub
        ElseIf TieneObjetos(1350, 1, Userindex) Then
            Call SendData(ToIndex, Userindex, 0, "||Necesitas 2000 Almas para mejorar tu item." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If
        
        If TieneObjetos(1351, 1, Userindex) And TieneObjetos(1500, 2000, Userindex) Then

            Arzhnnsz.Amount = 1
            Arzhnnsz.ObjIndex = 1434
            Call MeterItemEnInventario(Userindex, Arzhnnsz)
            Call SendData(ToIndex, Userindex, 0, "||Felicitaciones, has mejorado tu Armadura" & "´" & FontTypeNames.FONTTYPE_INFO)
            Call QuitarObjetos(1351, 1, Userindex)
            Call QuitarObjetos(1500, 2000, Userindex)
            Exit Sub
        ElseIf TieneObjetos(1351, 1, Userindex) Then
            Call SendData(ToIndex, Userindex, 0, "||Necesitas 2000 Almas para mejorar tu item." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If
      
        If TieneObjetos(1352, 1, Userindex) And TieneObjetos(1500, 2000, Userindex) Then

            Arzhnnsz.Amount = 1
            Arzhnnsz.ObjIndex = 1437
            Call MeterItemEnInventario(Userindex, Arzhnnsz)
            Call SendData(ToIndex, Userindex, 0, "||Felicitaciones, has mejorado tu Armadura" & "´" & FontTypeNames.FONTTYPE_INFO)
            Call QuitarObjetos(1352, 1, Userindex)
            Call QuitarObjetos(1500, 2000, Userindex)
            Exit Sub
        ElseIf TieneObjetos(1352, 1, Userindex) Then
            Call SendData(ToIndex, Userindex, 0, "||Necesitas 2000 Almas para mejorar tu item." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If
        
        If TieneObjetos(1353, 1, Userindex) And TieneObjetos(1500, 2000, Userindex) Then

            Arzhnnsz.Amount = 1
            Arzhnnsz.ObjIndex = 1440
            Call MeterItemEnInventario(Userindex, Arzhnnsz)
            Call SendData(ToIndex, Userindex, 0, "||Felicitaciones, has mejorado tu Armadura" & "´" & FontTypeNames.FONTTYPE_INFO)
            Call QuitarObjetos(1353, 1, Userindex)
            Call QuitarObjetos(1500, 2000, Userindex)
            Exit Sub
        ElseIf TieneObjetos(1353, 1, Userindex) Then
            Call SendData(ToIndex, Userindex, 0, "||Necesitas 2000 Almas para mejorar tu item." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If
        
        If TieneObjetos(1354, 1, Userindex) And TieneObjetos(1500, 2000, Userindex) Then

            Arzhnnsz.Amount = 1
            Arzhnnsz.ObjIndex = 1443
            Call MeterItemEnInventario(Userindex, Arzhnnsz)
            Call SendData(ToIndex, Userindex, 0, "||Felicitaciones, has mejorado tu Armadura" & "´" & FontTypeNames.FONTTYPE_INFO)
            Call QuitarObjetos(1354, 1, Userindex)
            Call QuitarObjetos(1500, 2000, Userindex)
            Exit Sub
        ElseIf TieneObjetos(1354, 1, Userindex) Then
            Call SendData(ToIndex, Userindex, 0, "||Necesitas 2000 Almas para mejorar tu item." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If
        
        If TieneObjetos(1398, 1, Userindex) And TieneObjetos(1500, 6000, Userindex) Then

            Arzhnnsz.Amount = 1
            Arzhnnsz.ObjIndex = 1399
            Call MeterItemEnInventario(Userindex, Arzhnnsz)
            Call SendData(ToIndex, Userindex, 0, "||Felicitaciones, has mejorado tu Armadura" & "´" & FontTypeNames.FONTTYPE_INFO)
            Call QuitarObjetos(1398, 1, Userindex)
            Call QuitarObjetos(1500, 6000, Userindex)
            Exit Sub
        ElseIf TieneObjetos(1398, 1, Userindex) Then
            Call SendData(ToIndex, Userindex, 0, "||Necesitas 6000 Almas para mejorar tu item." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If
        
        If TieneObjetos(1401, 1, Userindex) And TieneObjetos(1500, 6000, Userindex) Then

            Arzhnnsz.Amount = 1
            Arzhnnsz.ObjIndex = 1402
            Call MeterItemEnInventario(Userindex, Arzhnnsz)
            Call SendData(ToIndex, Userindex, 0, "||Felicitaciones, has mejorado tu Armadura" & "´" & FontTypeNames.FONTTYPE_INFO)
            Call QuitarObjetos(1401, 1, Userindex)
            Call QuitarObjetos(1500, 6000, Userindex)
            Exit Sub
        ElseIf TieneObjetos(1401, 1, Userindex) Then
            Call SendData(ToIndex, Userindex, 0, "||Necesitas 6000 Almas para mejorar tu item." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If
        
        If TieneObjetos(1404, 1, Userindex) And TieneObjetos(1500, 6000, Userindex) Then

            Arzhnnsz.Amount = 1
            Arzhnnsz.ObjIndex = 1405
            Call MeterItemEnInventario(Userindex, Arzhnnsz)
            Call SendData(ToIndex, Userindex, 0, "||Felicitaciones, has mejorado tu Armadura" & "´" & FontTypeNames.FONTTYPE_INFO)
            Call QuitarObjetos(1404, 1, Userindex)
            Call QuitarObjetos(1500, 6000, Userindex)
            Exit Sub
        ElseIf TieneObjetos(1404, 1, Userindex) Then
            Call SendData(ToIndex, Userindex, 0, "||Necesitas 6000 Almas para mejorar tu item." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If
        
        If TieneObjetos(1407, 1, Userindex) And TieneObjetos(1500, 6000, Userindex) Then

            Arzhnnsz.Amount = 1
            Arzhnnsz.ObjIndex = 1408
            Call MeterItemEnInventario(Userindex, Arzhnnsz)
            Call SendData(ToIndex, Userindex, 0, "||Felicitaciones, has mejorado tu Armadura" & "´" & FontTypeNames.FONTTYPE_INFO)
            Call QuitarObjetos(1407, 1, Userindex)
            Call QuitarObjetos(1500, 6000, Userindex)
            Exit Sub
        ElseIf TieneObjetos(1407, 1, Userindex) Then
            Call SendData(ToIndex, Userindex, 0, "||Necesitas 6000 Almas para mejorar tu item." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If
        
        If TieneObjetos(1410, 1, Userindex) And TieneObjetos(1500, 6000, Userindex) Then

            Arzhnnsz.Amount = 1
            Arzhnnsz.ObjIndex = 1411
            Call MeterItemEnInventario(Userindex, Arzhnnsz)
            Call SendData(ToIndex, Userindex, 0, "||Felicitaciones, has mejorado tu Armadura" & "´" & FontTypeNames.FONTTYPE_INFO)
            Call QuitarObjetos(1410, 1, Userindex)
            Call QuitarObjetos(1500, 6000, Userindex)
            Exit Sub
        ElseIf TieneObjetos(1410, 1, Userindex) Then
            Call SendData(ToIndex, Userindex, 0, "||Necesitas 6000 Almas para mejorar tu item." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If
        
        If TieneObjetos(1413, 1, Userindex) And TieneObjetos(1500, 6000, Userindex) Then

            Arzhnnsz.Amount = 1
            Arzhnnsz.ObjIndex = 1414
            Call MeterItemEnInventario(Userindex, Arzhnnsz)
            Call SendData(ToIndex, Userindex, 0, "||Felicitaciones, has mejorado tu Armadura" & "´" & FontTypeNames.FONTTYPE_INFO)
            Call QuitarObjetos(1413, 1, Userindex)
            Call QuitarObjetos(1500, 6000, Userindex)
            Exit Sub
        ElseIf TieneObjetos(1413, 1, Userindex) Then
            Call SendData(ToIndex, Userindex, 0, "||Necesitas 6000 Almas para mejorar tu item." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If
        
        If TieneObjetos(1416, 1, Userindex) And TieneObjetos(1500, 6000, Userindex) Then

            Arzhnnsz.Amount = 1
            Arzhnnsz.ObjIndex = 1417
            Call MeterItemEnInventario(Userindex, Arzhnnsz)
            Call SendData(ToIndex, Userindex, 0, "||Felicitaciones, has mejorado tu Armadura" & "´" & FontTypeNames.FONTTYPE_INFO)
            Call QuitarObjetos(1416, 1, Userindex)
            Call QuitarObjetos(1500, 6000, Userindex)
            Exit Sub
        ElseIf TieneObjetos(1416, 1, Userindex) Then
            Call SendData(ToIndex, Userindex, 0, "||Necesitas 6000 Almas para mejorar tu item." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If
        
        If TieneObjetos(1419, 1, Userindex) And TieneObjetos(1500, 6000, Userindex) Then

            Arzhnnsz.Amount = 1
            Arzhnnsz.ObjIndex = 1420
            Call MeterItemEnInventario(Userindex, Arzhnnsz)
            Call SendData(ToIndex, Userindex, 0, "||Felicitaciones, has mejorado tu Armadura" & "´" & FontTypeNames.FONTTYPE_INFO)
            Call QuitarObjetos(1419, 1, Userindex)
            Call QuitarObjetos(1500, 6000, Userindex)
            Exit Sub
        ElseIf TieneObjetos(1419, 1, Userindex) Then
            Call SendData(ToIndex, Userindex, 0, "||Necesitas 6000 Almas para mejorar tu item." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If
        
        If TieneObjetos(1422, 1, Userindex) And TieneObjetos(1500, 6000, Userindex) Then

            Arzhnnsz.Amount = 1
            Arzhnnsz.ObjIndex = 1423
            Call MeterItemEnInventario(Userindex, Arzhnnsz)
            Call SendData(ToIndex, Userindex, 0, "||Felicitaciones, has mejorado tu Armadura" & "´" & FontTypeNames.FONTTYPE_INFO)
            Call QuitarObjetos(1422, 1, Userindex)
            Call QuitarObjetos(1500, 6000, Userindex)
            Exit Sub
        ElseIf TieneObjetos(1422, 1, Userindex) Then
            Call SendData(ToIndex, Userindex, 0, "||Necesitas 6000 Almas para mejorar tu item." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If
        
        If TieneObjetos(1425, 1, Userindex) And TieneObjetos(1500, 6000, Userindex) Then

            Arzhnnsz.Amount = 1
            Arzhnnsz.ObjIndex = 1426
            Call MeterItemEnInventario(Userindex, Arzhnnsz)
            Call SendData(ToIndex, Userindex, 0, "||Felicitaciones, has mejorado tu Armadura" & "´" & FontTypeNames.FONTTYPE_INFO)
            Call QuitarObjetos(1425, 1, Userindex)
            Call QuitarObjetos(1500, 6000, Userindex)
            Exit Sub
        ElseIf TieneObjetos(1425, 1, Userindex) Then
            Call SendData(ToIndex, Userindex, 0, "||Necesitas 6000 Almas para mejorar tu item." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If
        
        If TieneObjetos(1428, 1, Userindex) And TieneObjetos(1500, 6000, Userindex) Then

            Arzhnnsz.Amount = 1
            Arzhnnsz.ObjIndex = 1429
            Call MeterItemEnInventario(Userindex, Arzhnnsz)
            Call SendData(ToIndex, Userindex, 0, "||Felicitaciones, has mejorado tu Armadura" & "´" & FontTypeNames.FONTTYPE_INFO)
            Call QuitarObjetos(1428, 1, Userindex)
            Call QuitarObjetos(1500, 6000, Userindex)
            Exit Sub
        ElseIf TieneObjetos(1428, 1, Userindex) Then
            Call SendData(ToIndex, Userindex, 0, "||Necesitas 6000 Almas para mejorar tu item." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If
        
        If TieneObjetos(1431, 1, Userindex) And TieneObjetos(1500, 6000, Userindex) Then

            Arzhnnsz.Amount = 1
            Arzhnnsz.ObjIndex = 1432
            Call MeterItemEnInventario(Userindex, Arzhnnsz)
            Call SendData(ToIndex, Userindex, 0, "||Felicitaciones, has mejorado tu Armadura" & "´" & FontTypeNames.FONTTYPE_INFO)
            Call QuitarObjetos(1431, 1, Userindex)
            Call QuitarObjetos(1500, 6000, Userindex)
            Exit Sub
        ElseIf TieneObjetos(1431, 1, Userindex) Then
            Call SendData(ToIndex, Userindex, 0, "||Necesitas 6000 Almas para mejorar tu item." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If
        
        If TieneObjetos(1434, 1, Userindex) And TieneObjetos(1500, 6000, Userindex) Then

            Arzhnnsz.Amount = 1
            Arzhnnsz.ObjIndex = 1435
            Call MeterItemEnInventario(Userindex, Arzhnnsz)
            Call SendData(ToIndex, Userindex, 0, "||Felicitaciones, has mejorado tu Armadura" & "´" & FontTypeNames.FONTTYPE_INFO)
            Call QuitarObjetos(1434, 1, Userindex)
            Call QuitarObjetos(1500, 6000, Userindex)
            Exit Sub
        ElseIf TieneObjetos(1434, 1, Userindex) Then
            Call SendData(ToIndex, Userindex, 0, "||Necesitas 6000 Almas para mejorar tu item." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If
        
        If TieneObjetos(1437, 1, Userindex) And TieneObjetos(1500, 6000, Userindex) Then

            Arzhnnsz.Amount = 1
            Arzhnnsz.ObjIndex = 1438
            Call MeterItemEnInventario(Userindex, Arzhnnsz)
            Call SendData(ToIndex, Userindex, 0, "||Felicitaciones, has mejorado tu Armadura" & "´" & FontTypeNames.FONTTYPE_INFO)
            Call QuitarObjetos(1437, 1, Userindex)
            Call QuitarObjetos(1500, 6000, Userindex)
            Exit Sub
        ElseIf TieneObjetos(1437, 1, Userindex) Then
            Call SendData(ToIndex, Userindex, 0, "||Necesitas 6000 Almas para mejorar tu item." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If
        
        If TieneObjetos(1440, 1, Userindex) And TieneObjetos(1500, 6000, Userindex) Then

            Arzhnnsz.Amount = 1
            Arzhnnsz.ObjIndex = 1441
            Call MeterItemEnInventario(Userindex, Arzhnnsz)
            Call SendData(ToIndex, Userindex, 0, "||Felicitaciones, has mejorado tu Armadura" & "´" & FontTypeNames.FONTTYPE_INFO)
            Call QuitarObjetos(1440, 1, Userindex)
            Call QuitarObjetos(1500, 6000, Userindex)
            Exit Sub
        ElseIf TieneObjetos(1440, 1, Userindex) Then
            Call SendData(ToIndex, Userindex, 0, "||Necesitas 6000 Almas para mejorar tu item." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If
        
        If TieneObjetos(1441, 1, Userindex) And TieneObjetos(1500, 10000, Userindex) Then

            Arzhnnsz.Amount = 1
            Arzhnnsz.ObjIndex = 1442
            Call MeterItemEnInventario(Userindex, Arzhnnsz)
            Call SendData(ToIndex, Userindex, 0, "||Felicitaciones, has mejorado tu Armadura" & "´" & FontTypeNames.FONTTYPE_INFO)
            Call QuitarObjetos(1441, 1, Userindex)
            Call QuitarObjetos(1500, 10000, Userindex)
            Exit Sub
        ElseIf TieneObjetos(1441, 1, Userindex) Then
            Call SendData(ToIndex, Userindex, 0, "||Necesitas 10000 Almas para mejorar tu item." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If
        
        If TieneObjetos(1443, 1, Userindex) And TieneObjetos(1500, 6000, Userindex) Then

            Arzhnnsz.Amount = 1
            Arzhnnsz.ObjIndex = 1444
            Call MeterItemEnInventario(Userindex, Arzhnnsz)
            Call SendData(ToIndex, Userindex, 0, "||Felicitaciones, has mejorado tu Armadura" & "´" & FontTypeNames.FONTTYPE_INFO)
            Call QuitarObjetos(1443, 1, Userindex)
            Call QuitarObjetos(1500, 6000, Userindex)
            Exit Sub
        ElseIf TieneObjetos(1443, 1, Userindex) Then
            Call SendData(ToIndex, Userindex, 0, "||Necesitas 6000 Almas para mejorar tu item." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If
        
        If TieneObjetos(1399, 1, Userindex) And TieneObjetos(1500, 10000, Userindex) Then

            Arzhnnsz.Amount = 1
            Arzhnnsz.ObjIndex = 1400
            Call MeterItemEnInventario(Userindex, Arzhnnsz)
            Call SendData(ToIndex, Userindex, 0, "||Felicitaciones, has mejorado tu Armadura" & "´" & FontTypeNames.FONTTYPE_INFO)
            Call QuitarObjetos(1399, 1, Userindex)
            Call QuitarObjetos(1500, 10000, Userindex)
            Exit Sub
        ElseIf TieneObjetos(1399, 1, Userindex) Then
            Call SendData(ToIndex, Userindex, 0, "||Necesitas 10000 Almas para mejorar tu item." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If
        
        If TieneObjetos(1402, 1, Userindex) And TieneObjetos(1500, 10000, Userindex) Then

            Arzhnnsz.Amount = 1
            Arzhnnsz.ObjIndex = 1403
            Call MeterItemEnInventario(Userindex, Arzhnnsz)
            Call SendData(ToIndex, Userindex, 0, "||Felicitaciones, has mejorado tu Armadura" & "´" & FontTypeNames.FONTTYPE_INFO)
            Call QuitarObjetos(1402, 1, Userindex)
            Call QuitarObjetos(1500, 10000, Userindex)
            Exit Sub
        ElseIf TieneObjetos(1402, 1, Userindex) Then
            Call SendData(ToIndex, Userindex, 0, "||Necesitas 10000 Almas para mejorar tu item." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If
        
        If TieneObjetos(1405, 1, Userindex) And TieneObjetos(1500, 10000, Userindex) Then

            Arzhnnsz.Amount = 1
            Arzhnnsz.ObjIndex = 1406
            Call MeterItemEnInventario(Userindex, Arzhnnsz)
            Call SendData(ToIndex, Userindex, 0, "||Felicitaciones, has mejorado tu Armadura" & "´" & FontTypeNames.FONTTYPE_INFO)
            Call QuitarObjetos(1405, 1, Userindex)
            Call QuitarObjetos(1500, 10000, Userindex)
            Exit Sub
        ElseIf TieneObjetos(1405, 1, Userindex) Then
            Call SendData(ToIndex, Userindex, 0, "||Necesitas 10000 Almas para mejorar tu item." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If
        
        If TieneObjetos(1408, 1, Userindex) And TieneObjetos(1500, 10000, Userindex) Then

            Arzhnnsz.Amount = 1
            Arzhnnsz.ObjIndex = 1409
            Call MeterItemEnInventario(Userindex, Arzhnnsz)
            Call SendData(ToIndex, Userindex, 0, "||Felicitaciones, has mejorado tu Armadura" & "´" & FontTypeNames.FONTTYPE_INFO)
            Call QuitarObjetos(1408, 1, Userindex)
            Call QuitarObjetos(1500, 10000, Userindex)
            Exit Sub
        ElseIf TieneObjetos(1408, 1, Userindex) Then
            Call SendData(ToIndex, Userindex, 0, "||Necesitas 10000 Almas para mejorar tu item." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If
        
        If TieneObjetos(1411, 1, Userindex) And TieneObjetos(1500, 10000, Userindex) Then

            Arzhnnsz.Amount = 1
            Arzhnnsz.ObjIndex = 1412
            Call MeterItemEnInventario(Userindex, Arzhnnsz)
            Call SendData(ToIndex, Userindex, 0, "||Felicitaciones, has mejorado tu Armadura" & "´" & FontTypeNames.FONTTYPE_INFO)
            Call QuitarObjetos(1411, 1, Userindex)
            Call QuitarObjetos(1500, 10000, Userindex)
            Exit Sub
        ElseIf TieneObjetos(1411, 1, Userindex) Then
            Call SendData(ToIndex, Userindex, 0, "||Necesitas 10000 Almas para mejorar tu item." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If
        
        If TieneObjetos(1414, 1, Userindex) And TieneObjetos(1500, 10000, Userindex) Then

            Arzhnnsz.Amount = 1
            Arzhnnsz.ObjIndex = 1415
            Call MeterItemEnInventario(Userindex, Arzhnnsz)
            Call SendData(ToIndex, Userindex, 0, "||Felicitaciones, has mejorado tu Armadura" & "´" & FontTypeNames.FONTTYPE_INFO)
            Call QuitarObjetos(1414, 1, Userindex)
            Call QuitarObjetos(1500, 10000, Userindex)
            Exit Sub
        ElseIf TieneObjetos(1414, 1, Userindex) Then
            Call SendData(ToIndex, Userindex, 0, "||Necesitas 10000 Almas para mejorar tu item." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If
        
        If TieneObjetos(1417, 1, Userindex) And TieneObjetos(1500, 10000, Userindex) Then

            Arzhnnsz.Amount = 1
            Arzhnnsz.ObjIndex = 1418
            Call MeterItemEnInventario(Userindex, Arzhnnsz)
            Call SendData(ToIndex, Userindex, 0, "||Felicitaciones, has mejorado tu Armadura" & "´" & FontTypeNames.FONTTYPE_INFO)
            Call QuitarObjetos(1417, 1, Userindex)
            Call QuitarObjetos(1500, 10000, Userindex)
            Exit Sub
        ElseIf TieneObjetos(1417, 1, Userindex) Then
            Call SendData(ToIndex, Userindex, 0, "||Necesitas 10000 Almas para mejorar tu item." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If
        
        If TieneObjetos(1420, 1, Userindex) And TieneObjetos(1500, 10000, Userindex) Then

            Arzhnnsz.Amount = 1
            Arzhnnsz.ObjIndex = 1421
            Call MeterItemEnInventario(Userindex, Arzhnnsz)
            Call SendData(ToIndex, Userindex, 0, "||Felicitaciones, has mejorado tu Armadura" & "´" & FontTypeNames.FONTTYPE_INFO)
            Call QuitarObjetos(1420, 1, Userindex)
            Call QuitarObjetos(1500, 10000, Userindex)
            Exit Sub
        ElseIf TieneObjetos(1420, 1, Userindex) Then
            Call SendData(ToIndex, Userindex, 0, "||Necesitas 10000 Almas para mejorar tu item." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If
        
        If TieneObjetos(1423, 1, Userindex) And TieneObjetos(1500, 10000, Userindex) Then

            Arzhnnsz.Amount = 1
            Arzhnnsz.ObjIndex = 1424
            Call MeterItemEnInventario(Userindex, Arzhnnsz)
            Call SendData(ToIndex, Userindex, 0, "||Felicitaciones, has mejorado tu Armadura" & "´" & FontTypeNames.FONTTYPE_INFO)
            Call QuitarObjetos(1423, 1, Userindex)
            Call QuitarObjetos(1500, 10000, Userindex)
            Exit Sub
        ElseIf TieneObjetos(1423, 1, Userindex) Then
            Call SendData(ToIndex, Userindex, 0, "||Necesitas 10000 Almas para mejorar tu item." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If
        
        If TieneObjetos(1426, 1, Userindex) And TieneObjetos(1500, 10000, Userindex) Then

            Arzhnnsz.Amount = 1
            Arzhnnsz.ObjIndex = 1427
            Call MeterItemEnInventario(Userindex, Arzhnnsz)
            Call SendData(ToIndex, Userindex, 0, "||Felicitaciones, has mejorado tu Armadura" & "´" & FontTypeNames.FONTTYPE_INFO)
            Call QuitarObjetos(1426, 1, Userindex)
            Call QuitarObjetos(1500, 10000, Userindex)
            Exit Sub
        ElseIf TieneObjetos(1426, 1, Userindex) Then
            Call SendData(ToIndex, Userindex, 0, "||Necesitas 10000 Almas para mejorar tu item." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If
        
        If TieneObjetos(1429, 1, Userindex) And TieneObjetos(1500, 10000, Userindex) Then

            Arzhnnsz.Amount = 1
            Arzhnnsz.ObjIndex = 1430
            Call MeterItemEnInventario(Userindex, Arzhnnsz)
            Call SendData(ToIndex, Userindex, 0, "||Felicitaciones, has mejorado tu Armadura" & "´" & FontTypeNames.FONTTYPE_INFO)
            Call QuitarObjetos(1429, 1, Userindex)
            Call QuitarObjetos(1500, 10000, Userindex)
            Exit Sub
        ElseIf TieneObjetos(1429, 1, Userindex) Then
            Call SendData(ToIndex, Userindex, 0, "||Necesitas 10000 Almas para mejorar tu item." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If
        
        If TieneObjetos(1432, 1, Userindex) And TieneObjetos(1500, 10000, Userindex) Then

            Arzhnnsz.Amount = 1
            Arzhnnsz.ObjIndex = 1433
            Call MeterItemEnInventario(Userindex, Arzhnnsz)
            Call SendData(ToIndex, Userindex, 0, "||Felicitaciones, has mejorado tu Armadura" & "´" & FontTypeNames.FONTTYPE_INFO)
            Call QuitarObjetos(1432, 1, Userindex)
            Call QuitarObjetos(1500, 10000, Userindex)
            Exit Sub
        ElseIf TieneObjetos(1432, 1, Userindex) Then
            Call SendData(ToIndex, Userindex, 0, "||Necesitas 10000 Almas para mejorar tu item." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If
        
        If TieneObjetos(1435, 1, Userindex) And TieneObjetos(1500, 10000, Userindex) Then

            Arzhnnsz.Amount = 1
            Arzhnnsz.ObjIndex = 1436
            Call MeterItemEnInventario(Userindex, Arzhnnsz)
            Call SendData(ToIndex, Userindex, 0, "||Felicitaciones, has mejorado tu Armadura" & "´" & FontTypeNames.FONTTYPE_INFO)
            Call QuitarObjetos(1435, 1, Userindex)
            Call QuitarObjetos(1500, 10000, Userindex)
            Exit Sub
        ElseIf TieneObjetos(1435, 1, Userindex) Then
            Call SendData(ToIndex, Userindex, 0, "||Necesitas 10000 Almas para mejorar tu item." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If
        
        If TieneObjetos(1438, 1, Userindex) And TieneObjetos(1500, 10000, Userindex) Then

            Arzhnnsz.Amount = 1
            Arzhnnsz.ObjIndex = 1439
            Call MeterItemEnInventario(Userindex, Arzhnnsz)
            Call SendData(ToIndex, Userindex, 0, "||Felicitaciones, has mejorado tu Armadura" & "´" & FontTypeNames.FONTTYPE_INFO)
            Call QuitarObjetos(1438, 1, Userindex)
            Call QuitarObjetos(1500, 10000, Userindex)
            Exit Sub
        ElseIf TieneObjetos(1439, 1, Userindex) Then
            Call SendData(ToIndex, Userindex, 0, "||Necesitas 10000 Almas para mejorar tu item." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If
        
        If TieneObjetos(1444, 1, Userindex) And TieneObjetos(1500, 10000, Userindex) Then

            Arzhnnsz.Amount = 1
            Arzhnnsz.ObjIndex = 1445
            Call MeterItemEnInventario(Userindex, Arzhnnsz)
            Call SendData(ToIndex, Userindex, 0, "||Felicitaciones, has mejorado tu Armadura" & "´" & FontTypeNames.FONTTYPE_INFO)
            Call QuitarObjetos(1444, 1, Userindex)
            Call QuitarObjetos(1500, 10000, Userindex)
            Exit Sub
        ElseIf TieneObjetos(1445, 1, Userindex) Then
            Call SendData(ToIndex, Userindex, 0, "||Necesitas 10000 Almas para mejorar tu item." & "´" & FontTypeNames.FONTTYPE_INFO)
            Exit Sub

        End If
      
    End If

    'IRON AO: CREACIÓN DE OBJETO FIN

    '<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
    'Si no esta logeado y envia un comando diferente a los
    'de arriba cerramos la conexion.
    '<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

    'pluto:2.13
    If Not UserList(Userindex).flags.UserLogged Then    'Or Not Cuentas(UserIndex).Logged = True Then

        'Call LogError("Mesaje enviado sin logearse:" & rdata)
        ' Call CloseUser(UserIndex)
        Call CloseSocket(Userindex)
        Exit Sub

    End If

    'PLUTO 2.24 distribución de los TCP
    If UserList(Userindex).flags.Privilegios > 0 Then
        Call TCP3.TCP3(Userindex, rdata)

    End If

    If Left(rdata, 1) = "/" Then
        Call TCP2.TCP2(Userindex, rdata)
        Exit Sub

    End If

    Call TCP1.TCP1(Userindex, rdata)

    Exit Sub
ErrorHandler:        'pluto:6.9
    Call LogError("Error en handledata. Nombre:" & UserList(Userindex).Name & " Ip: " & UserList(Userindex).ip & _
       " HD: " & UserList(Userindex).Serie & " Datos: " & rdata & " Desc: " & Err.number & ": " & _
       Err.Description)

End Sub

Sub ReloadSokcet()
    Debug.Print "ReloadSocket"

    On Error GoTo errhandler

    #If UsarQueSocket = 1 Then

        Call LogApiSock("ReloadSokcet() " & NumUsers & " " & LastUser & " " & MaxUsers)

        If NumUsers <= 0 Then
            Call WSApiReiniciarSockets
        Else

            '       Call apiclosesocket(SockListen)
            '       SockListen = ListenForConnect(Puerto, hWndMsg, "")
        End If

    #ElseIf UsarQueSocket = 0 Then

        frmMain.Socket1.Cleanup
        Call ConfigListeningSocket(frmMain.Socket1, Puerto)

    #ElseIf UsarQueSocket = 2 Then

    #End If

    Exit Sub
errhandler:
    Call LogError("Error en CheckSocketState " & Err.number & ": " & Err.Description)

End Sub

Sub ActualizarHechizos(Userindex As Integer)

    On Error GoTo fallo

    Dim X As Integer

    For X = 1 To MAXUSERHECHIZOS

        If UserList(Userindex).Stats.UserHechizos(X) <> 0 Then
            Call SendData2(ToIndex, Userindex, 0, 34, X & "," & UserList(Userindex).Stats.UserHechizos(X) & "," & _
                                                      Hechizos(UserList(Userindex).Stats.UserHechizos(X)).Nombre)
        Else
            Call SendData2(ToIndex, Userindex, 0, 34, X & ",0,(None)")

        End If

    Next

    Exit Sub
fallo:
    Call LogError("actualizarhechizos " & Err.number & " D: " & Err.Description)

End Sub

Public Sub WriteConsoleMsg(ByVal Userindex As Integer, ByVal msg As String, ByVal Font As FontTypeNames)

    Call SendData(ToIndex, Userindex, 0, "||" & msg & "´" & Font)

End Sub

