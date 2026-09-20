VERSION 1.0 CLASS
BEGIN
  MultiUse = -1  'True
  Persistable = 0  'NotPersistable
  DataBindingBehavior = 0  'vbNone
  DataSourceBehavior  = 0  'vbNone
  MTSTransactionMode  = 0  'NotAnMTSObject
END
Attribute VB_Name = "cGuild"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = True
Attribute VB_PredeclaredId = False
Attribute VB_Exposed = False
Option Explicit

'this member variables should be private.. but i
'dont have enough time to write the four methods that
'requires each of them to query and update ....

Public ElectionPeriod As Long

Public Founder As String
Public FundationDate As String
Public Description As String
Private codex(0 To 7) As String
Public leader As String
Public Reputation As Long 'nati(19.06.11): cambio "Double" a "Long"
Public Faccion As Byte
'pluto 6.9
Public PuntosTorneos As Long
'pluto:6.0A-------
Public Nivel As Byte
Public SalaClan As Integer
'-----------------
Public Gold As Double
Public GuildName As String
Public URL As String
Public Emblema As String
Public GuildExperience As Double
Public DaysSinceLastElection As Long
Public GuildNews As String

Public AlliedGuilds As Collection
Public EnemyGuilds As Collection
Public Members As Collection
Public Solicitudes As Collection
Public PeacePropositions As Collection
Public Votes As Collection
Public Elections As Boolean

Private Type tVotes

    Name As String
    Cant As Long

End Type

Public Function GetCodex(ByVal number As Byte) As String
    GetCodex = codex(number)

End Function

Public Function CodexLenght() As Integer
    Dim t%

    For t% = 0 To 7

        If codex(t%) = "" Then Exit For
        If t% = 7 Then Exit For
    Next t%

    CodexLenght = t%

End Function

Public Function DaysToNextElection() As Integer
    DaysToNextElection = ElectionPeriod - DaysSinceLastElection

End Function

Private Function TestName(ByVal cad As String) As Boolean
    Dim car As Byte
    Dim i As Integer

    cad = LCase$(cad)

    For i = 1 To Len(cad)
        car = Asc(mid$(cad, i, 1))

        If (car < 97 Or car > 122) And (car <> 255) And (car <> 32) Then
            TestName = False
            Exit Function

        End If

    Next i

    TestName = True

End Function

Public Sub UpdateCodexAndDesc(ByVal rdata As String)

    Description = ReadField(1, rdata, Asc("¬"))

    Dim Mandamientos As Integer
    Mandamientos = CInt(ReadField(2, rdata, Asc("¬")))

    Dim i As Integer

    For i = 1 To Mandamientos
        codex(i - 1) = ReadField(2 + i, rdata, Asc("¬"))
    Next i

End Sub

Private Function ParseGuildInfo(ByRef GuildInfo As String, _
                                ByVal FounderName As String, _
                                ByVal Rep As Long) As Boolean

    On Err GoTo errhandler

    Founder = FounderName
    leader = Founder
    FundationDate = Now
    Description = ReadField(1, GuildInfo, Asc("¬"))
    GuildName = ReadField(2, GuildInfo, Asc("¬"))

    If Not TestName(GuildName) Then
        ParseGuildInfo = False
        Exit Function

    End If

    URL = ReadField(3, GuildInfo, Asc("¬"))
    Dim Mandamientos As Integer
    Mandamientos = CInt(ReadField(4, GuildInfo, Asc("¬")))
    Dim i As Integer

    For i = 1 To Mandamientos
        codex(i - 1) = ReadField(4 + i, GuildInfo, Asc("¬"))
    Next i

    Reputation = Rep
    Gold = 0
    GuildExperience = 0
    DaysSinceLastElection = 0
    GuildNews = "Clan iniciado."
    
    ParseGuildInfo = True

    Exit Function

errhandler:

End Function

Public Sub InitializeGuildFromDisk(ByVal number As Integer)
    Dim File As String

    File = App.Path & "\Guilds\" & "GuildsInfo.inf"

    GuildName = GetVar(File, "Guild" & number, "GuildName")
    Founder = GetVar(File, "Guild" & number, "Founder")
    FundationDate = GetVar(File, "Guild" & number, "Date")
    Description = GetVar(File, "Guild" & number, "Desc")
    codex(0) = GetVar(File, "Guild" & number, "Codex0")
    codex(1) = GetVar(File, "Guild" & number, "Codex1")
    codex(2) = GetVar(File, "Guild" & number, "Codex2")
    codex(3) = GetVar(File, "Guild" & number, "Codex3")
    codex(4) = GetVar(File, "Guild" & number, "Codex4")
    codex(5) = GetVar(File, "Guild" & number, "Codex5")
    codex(6) = GetVar(File, "Guild" & number, "Codex6")
    codex(7) = GetVar(File, "Guild" & number, "Codex7")
    leader = GetVar(File, "Guild" & number, "Leader")
    Reputation = val(GetVar(File, "Guild" & number, "Rep"))
    Faccion = val(GetVar(File, "Guild" & number, "Faccion"))
    'pluto:6.9
    PuntosTorneos = val(GetVar(File, "Guild" & number, "PuntosTorneos"))
    'pluto:6.0A---------
    Nivel = val(GetVar(File, "Guild" & number, "Nivel"))
    SalaClan = val(GetVar(File, "Guild" & number, "SalaClan"))
    '----------------
    Gold = val(GetVar(File, "Guild" & number, "Gold"))
    URL = GetVar(File, "Guild" & number, "URL")
    Emblema = GetVar(File, "Guild" & number, "LOGO")
    GuildExperience = val(GetVar(File, "Guild" & number, "Exp"))
    DaysSinceLastElection = val(GetVar(File, "Guild" & number, "DaysLast"))
    GuildNews = GetVar(File, "Guild" & number, "GuildNews")

    'pluto:6.0A
    NameClan(number) = GuildName

    Call LoadGuildMembers(GuildName)
    Call LoadSolicitudes(GuildName)
    Call LoadAlliedGuilds(GuildName)
    Call LoadEnemyGuilds(GuildName)
    Call LoadPeacePropositions(GuildName)
    'pluto:6.0A
    Call LoadObjetosClan(number)

End Sub

Private Sub LoadObjetosClan(ByVal number As Byte)
'pluto:6.0A
    Dim loopc As Byte
    'Dim Nombreobjclan(300) As String
    'Dim objetosclan As Integer

    Dim ln As String

    For loopc = 1 To 40
        Dim f As String
        f = App.Path & "\Guilds\" & GuildName & "-Boveda" & ".dat"
        ln = GetVar(f, "BOVEDA", "Obj" & loopc)

        ObjetosClan(number).ObjSlot(loopc).ObjIndex = val(ReadField(1, ln, 45))
        ObjetosClan(number).ObjSlot(loopc).Amount = val(ReadField(2, ln, 45))

    Next loopc

End Sub

Private Sub LoadGuildMembers(ByVal GuildName As String)

    Dim f As String
    f = App.Path & "\Guilds\" & GuildName & "-Members" & ".mem"

    Dim t As Long
    t = val(GetVar(f, "INIT", "NroMembers"))

    Dim J As Integer

    For J = 1 To t
        Call Members.Add(GetVar(f, "Members", "Member" & J))
    Next J

End Sub

Private Sub LoadSolicitudes(ByVal GuildName As String)

    Dim f As String

    f = App.Path & "\Guilds\" & GuildName & "-Solicitudes" & ".sol"

    Dim t As Long
    t = val(GetVar(f, "INIT", "Nro"))

    If t > 25 Then Exit Sub

    Dim J As Integer
    Dim sol As cSolicitud

    For J = 1 To t
        Set sol = New cSolicitud
        sol.UserName = GetVar(f, "Sol" & J, "Name")
        sol.Desc = GetVar(f, "Sol" & J, "Desc")
        Call Solicitudes.Add(sol)
    Next J

End Sub

Private Sub LoadPeacePropositions(ByVal GuildName As String)

    Dim f As String

    f = App.Path & "\Guilds\" & GuildName & "-Propositions" & ".pro"

    Dim t As Long

    t = val(GetVar(f, "INIT", "Nro"))

    Dim J As Integer
    Dim sol As cSolicitud

    For J = 1 To t
        Set sol = New cSolicitud
        sol.UserName = GetVar(f, "Sol" & J, "Name")
        sol.Desc = GetVar(f, "Sol" & J, "Desc")
        Call PeacePropositions.Add(sol)
    Next J

End Sub

Private Sub SaveAlliedGuilds(ByVal GuildName As String)

    Dim f As String

    f = App.Path & "\Guilds\" & GuildName & "-Allied.all"

    If FileExist(f, vbNormal) Then Kill f

    Call WriteVar(f, "INIT", "NroAllies", AlliedGuilds.Count)

    Dim J As Integer

    For J = 1 To AlliedGuilds.Count
        Call WriteVar(f, "Allies", "Allie" & J, AlliedGuilds(J))
    Next J

End Sub

Private Sub LoadAlliedGuilds(ByVal GuildName As String)

    Dim f As String

    f = App.Path & "\Guilds\" & GuildName & "-Allied.all"

    Dim t As Long
    t = val(GetVar(f, "INIT", "NroAllies"))

    Dim J As Integer

    For J = 1 To t
        Call AlliedGuilds.Add(GetVar(f, "Allies", "Allie" & J))
    Next J

End Sub

Private Sub SaveEnemyGuilds(ByVal GuildName As String)

    Dim f As String

    f = App.Path & "\Guilds\" & GuildName & "-Enemys.ene"

    If FileExist(f, vbNormal) Then Kill f

    Call WriteVar(f, "INIT", "NroEnemys", EnemyGuilds.Count)

    Dim J As Integer

    For J = 1 To EnemyGuilds.Count
        Call WriteVar(f, "Enemys", "Enemy" & J, EnemyGuilds(J))
    Next J

End Sub

Private Sub LoadEnemyGuilds(ByVal GuildName As String)

    Dim f As String

    f = App.Path & "\Guilds\" & GuildName & "-Enemys.ene"

    Dim t As Long
    t = val(GetVar(f, "INIT", "NroEnemys"))

    Dim J As Integer

    For J = 1 To t
        Call EnemyGuilds.Add(GetVar(f, "Enemys", "Enemy" & J))
    Next J

End Sub

Private Sub SaveGuildMembers(ByVal GuildName As String)

    Dim f As String

    f = App.Path & "\Guilds\" & GuildName & "-Members.mem"

    If FileExist(f, vbNormal) Then Kill f

    Call WriteVar(f, "INIT", "NroMembers", Members.Count)

    Dim J As Integer

    For J = 1 To Members.Count
        Call WriteVar(f, "Members", "Member" & J, Members(J))
    Next J

End Sub

Private Sub SaveSolicitudes(ByVal GuildName As String)

    Dim f As String

    f = App.Path & "\Guilds\" & GuildName & "-Solicitudes.sol"

    If FileExist(f, vbNormal) Then Kill f

    Call WriteVar(f, "INIT", "Nro", Solicitudes.Count)

    Dim J As Integer

    For J = 1 To Solicitudes.Count
        Call WriteVar(f, "Sol" & J, "Name", Solicitudes(J).UserName)
        Call WriteVar(f, "Sol" & J, "Desc", Solicitudes(J).Desc)
    Next J

End Sub

Private Sub SavePeacePropositions(ByVal GuildName As String)

    Dim f As String

    f = App.Path & "\Guilds\" & GuildName & "-Propositions.pro"

    If FileExist(f, vbNormal) Then Kill f

    Call WriteVar(f, "INIT", "Nro", PeacePropositions.Count)

    Dim J As Integer

    For J = 1 To PeacePropositions.Count
        Call WriteVar(f, "Pro" & J, "Name", PeacePropositions(J).UserName)
        Call WriteVar(f, "Pro" & J, "Desc", PeacePropositions(J).Desc)
    Next J

End Sub

Public Sub SaveGuild(ByVal File As String, ByVal GuildNumber)

    On Error GoTo errhandler

    Call WriteVar(File, "GUILD" & GuildNumber, "GuildName", GuildName)
    Call WriteVar(File, "GUILD" & GuildNumber, "Founder", Founder)
    Call WriteVar(File, "GUILD" & GuildNumber, "GuildName", GuildName)
    Call WriteVar(File, "GUILD" & GuildNumber, "Date", FundationDate)
    Call WriteVar(File, "GUILD" & GuildNumber, "Desc", Description)
    Call WriteVar(File, "GUILD" & GuildNumber, "Codex0", codex(0))
    Call WriteVar(File, "GUILD" & GuildNumber, "Codex1", codex(1))
    Call WriteVar(File, "GUILD" & GuildNumber, "Codex2", codex(2))
    Call WriteVar(File, "GUILD" & GuildNumber, "Codex3", codex(3))
    Call WriteVar(File, "GUILD" & GuildNumber, "Codex4", codex(4))
    Call WriteVar(File, "GUILD" & GuildNumber, "Codex5", codex(5))
    Call WriteVar(File, "GUILD" & GuildNumber, "Codex6", codex(6))
    Call WriteVar(File, "GUILD" & GuildNumber, "Codex7", codex(7))
    Call WriteVar(File, "GUILD" & GuildNumber, "Leader", leader)
    Call WriteVar(File, "GUILD" & GuildNumber, "URL", URL)
    Call WriteVar(File, "GUILD" & GuildNumber, "LOGO", Emblema)
    Call WriteVar(File, "GUILD" & GuildNumber, "GuildExp", str(GuildExperience))
    Call WriteVar(File, "GUILD" & GuildNumber, "DaysLast", str(DaysSinceLastElection))
    Call WriteVar(File, "GUILD" & GuildNumber, "GuildNews", GuildNews)
    Call WriteVar(File, "GUILD" & GuildNumber, "Rep", str(Reputation))
    Call WriteVar(File, "GUILD" & GuildNumber, "Faccion", str(Faccion))
    'pluto:6.9
    Call WriteVar(File, "GUILD" & GuildNumber, "PuntosTorneos", str(PuntosTorneos))
    'pluto:6.0A------
    Call WriteVar(File, "GUILD" & GuildNumber, "Nivel", str(Nivel))
    Call WriteVar(File, "GUILD" & GuildNumber, "SalaClan", str(SalaClan))
    '-----------------
    Call SaveAlliedGuilds(GuildName)
    Call SaveEnemyGuilds(GuildName)
    Call SaveGuildMembers(GuildName)
    Call SaveSolicitudes(GuildName)
    Call SavePeacePropositions(GuildName)

    Exit Sub

errhandler:

End Sub

Public Function Initialize(ByVal GuildInfo As String, _
                           ByVal FounderName As String, _
                           ByVal Rep As Long) As Boolean
    Initialize = ParseGuildInfo(GuildInfo, FounderName, Rep)

End Function

Private Sub Class_Initialize()

    Set AlliedGuilds = New Collection
    Set EnemyGuilds = New Collection
    Set Members = New Collection
    Set Solicitudes = New Collection
    Set PeacePropositions = New Collection
    Set Votes = New Collection

    ElectionPeriod = 45

End Sub

Public Function IsEnemy(ByVal GuildName As String) As Boolean

    Dim k As Integer

    GuildName = UCase$(GuildName)

    For k = 1 To EnemyGuilds.Count

        If UCase$(EnemyGuilds(k)) = GuildName Then
            IsEnemy = True
            Exit Function

        End If

    Next k

End Function

Public Function IsAllie(ByVal GuildName As String) As Boolean

    Dim k As Integer

    GuildName = UCase$(GuildName)

    For k = 1 To AlliedGuilds.Count

        If UCase$(AlliedGuilds(k)) = GuildName Then
            IsAllie = True
            Exit Function

        End If

    Next k

    IsAllie = False

End Function

Public Function SolicitudesIncludes(ByVal UserName As String) As Boolean

    Dim k As Integer

    UserName = UCase$(UserName)

    For k = 1 To Solicitudes.Count

        If UCase$(Solicitudes(k).UserName) = UserName Then
            SolicitudesIncludes = True
            Exit Function

        End If

    Next k

End Function

Public Sub RemoveSolicitud(ByVal UserName As String)

    Dim k As Integer

    UserName = UCase$(UserName)

    For k = 1 To Solicitudes.Count

        If UCase$(Solicitudes(k).UserName) = UserName Then
            Call Solicitudes.Remove(k)
            Exit Sub

        End If

    Next k

End Sub

Public Sub RemoveProposition(ByVal UserName As String)

    Dim k As Integer

    UserName = UCase$(UserName)

    For k = 1 To PeacePropositions.Count

        If UCase$(PeacePropositions(k).UserName) = UserName Then
            Call PeacePropositions.Remove(k)
            Exit Sub

        End If

    Next k

End Sub

Public Sub RemoveAllie(ByVal Name As String)
    Dim k As Integer
    Name = UCase$(Name)

    For k = 1 To AlliedGuilds.Count

        If UCase$(AlliedGuilds(k)) = Name Then
            Call AlliedGuilds.Remove(k)
            Exit Sub

        End If

    Next k

End Sub

Public Sub RemoveEnemy(ByVal Name As String)
    Dim k As Integer
    Name = UCase$(Name)

    For k = 1 To EnemyGuilds.Count

        If UCase$(EnemyGuilds(k)) = Name Then
            Call EnemyGuilds.Remove(k)
            Exit Sub

        End If

    Next k

End Sub

Public Sub RemoveMember(ByVal UserName As String)

    Dim k As Integer

    UserName = UCase$(UserName)

    For k = 1 To Members.Count

        If UCase$(Members(k)) = UserName Then
            Call Members.Remove(k)
            Exit Sub

        End If

    Next k

End Sub

Public Function GetPeaceRequest(ByVal UserName As String) As cSolicitud

    Dim k As Integer

    UserName = UCase$(UserName)

    For k = 1 To PeacePropositions.Count

        If UCase$(PeacePropositions(k).UserName) = UserName Then
            Set GetPeaceRequest = PeacePropositions(k)
            Exit Function

        End If

    Next k

End Function

Public Sub TestSolicitudBound()

'Nos aseguramos que no halla más de 25 solicitudes
    If Me.Solicitudes.Count > 25 Then
        Dim i As Integer

        For i = 1 To Me.Solicitudes.Count
            Solicitudes.Remove 1
        Next i

    End If

End Sub

Public Function GetSolicitud(ByVal UserName As String) As cSolicitud

    Dim k As Integer

    UserName = UCase$(UserName)

    For k = 1 To Solicitudes.Count

        If UCase$(Solicitudes(k).UserName) = UserName Then
            Set GetSolicitud = Solicitudes(k)
            Exit Function

        End If

    Next k

End Function

Public Function IncludesPeaceOffer(ByVal Name As String) As Boolean

    Dim k As Integer

    Name = UCase$(Name)

    For k = 1 To PeacePropositions.Count

        If UCase$(PeacePropositions(k).UserName) = Name Then
            IncludesPeaceOffer = True
            Exit Function

        End If

    Next k

End Function

Public Sub ResetVotes()

    Dim k As Integer

    For k = 1 To Votes.Count
        Call Votes.Remove(1)
    Next k

End Sub

Public Function IsMember(ByVal Name As String) As Boolean

    Dim k As Integer

    Name = UCase$(Name)

    For k = 1 To Members.Count

        If UCase$(Members(k)) = Name Then
            IsMember = True
            Exit Function

        End If

    Next k

End Function

Public Function NuevoLider() As String

    Dim J As Integer, C As Integer

    Dim totals() As tVotes

    If Members.Count = 0 Then
        NuevoLider = "CLANCLAUSURADO"
        Exit Function

    End If

    ReDim totals(1 To Members.Count)

    For J = 1 To Members.Count

        totals(J).Name = Members(J)
        totals(J).Cant = 0

    Next J

    For J = 1 To Votes.Count

        For C = 1 To Members.Count

            If UCase$(totals(C).Name) = UCase$(Votes(J)) Then
                totals(C).Cant = totals(C).Cant + 1
                Exit For

            End If

        Next C

    Next J

    Dim max As Integer
    max = -1

    For J = 1 To Members.Count

        If totals(J).Cant > max Then
            max = totals(J).Cant
            NuevoLider = totals(J).Name

        End If

    Next J

End Function
