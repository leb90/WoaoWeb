Attribute VB_Name = "mdlCOmercioConUsuario"
'Modulo para comerciar con otro usuario
'Por Alejo (Alejandro Santos)
'
'
'[Alejo]

Option Explicit

Public Type tCOmercioUsuario

    DestUsu As Integer    'El otro Usuario
    Objeto As Integer    'Indice del inventario a comerciar, que objeto desea dar

    'El tipo de datos de Cant ahora es Long (antes Integer)
    'asi se puede comerciar con oro > 32k
    '[CORREGIDO]
    Cant As Long    'Cuantos comerciar, cuantos objetos desea dar
    '[/CORREGIDO]
    Acepto As Boolean

End Type

'origen: origen de la transaccion, originador del comando
'destino: receptor de la transaccion
Public Sub IniciarComercioConUsuario(Origen As Integer, Destino As Integer)

    On Error GoTo fallo

    'Actualiza el inventario del usuario
    Call UpdateUserInv(True, Origen, 0)

    'Decirle al origen que abra la ventanita.
    Call SendData(ToIndex, Origen, 0, "CU")
    UserList(Origen).flags.Comerciando = True

    'si es el receptor, enviamos el objeto del otro usu
    'If UserList(UserList(Origen).ComUsu.DestUsu).ComUsu.DestUsu = Origen Then
    If UserList(Origen).ComUsu.DestUsu = Destino Then
        Call EnviarObjetoTransaccion(Origen)

    End If

    Exit Sub
fallo:
    Call LogError("iniciarcomerciousuario " & Err.number & " D: " & Err.Description)

End Sub

'envia a AQuien el objeto del otro
Public Sub EnviarObjetoTransaccion(AQuien As Integer)

    On Error GoTo errhandler

    If AQuien = 0 Then Exit Sub
    'Dim Object As UserOBJ
    Dim ObjInd As Integer
    Dim ObjCant As Long

    'pluto:2.9.0
    If UserList(UserList(AQuien).ComUsu.DestUsu).ComUsu.Objeto = 0 Then Exit Sub
    If UserList(UserList(AQuien).ComUsu.DestUsu).ComUsu.Objeto = 1281 Then Exit Sub
    '[Alejo]: En esta funcion se centralizaba el problema
    '         de no poder comerciar con mas de 32k de oro.
    '         Ahora si funciona!!!

    'Object.Amount = UserList(UserList(AQuien).ComUsu.DestUsu).ComUsu.Cant
    ObjCant = UserList(UserList(AQuien).ComUsu.DestUsu).ComUsu.Cant

    If UserList(UserList(AQuien).ComUsu.DestUsu).ComUsu.Objeto = FLAGORO Then
        'Object.ObjIndex = iORO
        ObjInd = iORO
    Else
        'Object.ObjIndex = UserList(UserList(AQuien).ComUsu.DestUsu).Invent.Object(UserList(UserList(AQuien).ComUsu.DestUsu).ComUsu.Objeto).ObjIndex
        ObjInd = UserList(UserList(AQuien).ComUsu.DestUsu).Invent.Object(UserList(UserList( _
                                                                                  AQuien).ComUsu.DestUsu).ComUsu.Objeto).ObjIndex

    End If

    'If Object.ObjIndex > 0 And Object.Amount > 0 Then
    '    Call SendData(ToIndex, AQuien, 0, "COMUSUINV" & 1 & "," & Object.ObjIndex & "," & ObjData(Object.ObjIndex).Name & "," & Object.Amount & "," & Object.Equipped & "," & ObjData(Object.ObjIndex).GrhIndex & "," _
         '    & ObjData(Object.ObjIndex).ObjType & "," _
         '    & ObjData(Object.ObjIndex).MaxHIT & "," _
         '    & ObjData(Object.ObjIndex).MinHIT & "," _
         '    & ObjData(Object.ObjIndex).MaxDef & "," _
         '    & ObjData(Object.ObjIndex).Valor \ 3)
    'End If

    If ObjInd > 0 And ObjCant > 0 Then
        'pluto:2.12---------------------------
        Dim flu As String
        flu = ObjData(ObjInd).Name

        If ObjData(ObjInd).OBJType = 60 Then
            Dim flu2 As Byte
            flu2 = ObjInd - 887
            flu = ObjData(ObjInd).Name & "  Niv: " & UserList(UserList(AQuien).ComUsu.DestUsu).Montura.Nivel(flu2) & _
                  " Exp: " & UserList(UserList(AQuien).ComUsu.DestUsu).Montura.exp(flu2)

        End If

        '------------------------------------

        'pluto:2.3
        Call SendData2(ToIndex, AQuien, 0, 72, 1 & "," & ObjInd & "," & flu & "," & ObjCant & "," & 0 & "," & ObjData( _
                                               ObjInd).GrhIndex & "," & ObjData(ObjInd).OBJType & "," & ObjData(ObjInd).MaxHIT & "," & ObjData( _
                                               ObjInd).MinHIT & "," & ObjData(ObjInd).MaxDef & "," & ObjData(ObjInd).Valor \ 3 & "," & ObjData( _
                                               ObjInd).SubTipo)

    End If

    Exit Sub
errhandler:
    Call LogError("Enviarobjetotransaccion")

End Sub

Public Sub FinComerciarUsu(Userindex As Integer)

    On Error GoTo fallo

    If Userindex = 0 Then Exit Sub
    UserList(Userindex).ComUsu.Acepto = False
    UserList(Userindex).ComUsu.Cant = 0
    UserList(Userindex).ComUsu.DestUsu = 0
    UserList(Userindex).ComUsu.Objeto = 0

    UserList(Userindex).flags.Comerciando = False
    'pluto:2.7.0
    Call SendData(ToIndex, Userindex, 0, "||Ha finalizado el Comercio." & "´" & FontTypeNames.FONTTYPE_COMERCIO)

    Call SendData(ToIndex, Userindex, 0, "CF")

    Exit Sub
fallo:
    Call LogError("fincomerciarusu " & Err.number & " D: " & Err.Description)

End Sub

Public Sub AceptarComercioUsu(Userindex As Integer)

    On Error GoTo errhandler

    Dim ii As Byte
    'quitar todos los avis= son indicadores
    Dim avis As Byte
    avis = 0

    If Userindex = 0 Then Exit Sub
    If UserList(Userindex).ComUsu.DestUsu <= 0 Then Exit Sub
    If UserList(UserList(Userindex).ComUsu.DestUsu).ComUsu.DestUsu <> Userindex Then Exit Sub

    UserList(Userindex).ComUsu.Acepto = True

    If UserList(UserList(Userindex).ComUsu.DestUsu).ComUsu.Acepto = False Then
        Call SendData(ToIndex, Userindex, 0, "||El otro usuario aun no ha aceptado tu oferta." & "´" & _
                                             FontTypeNames.FONTTYPE_COMERCIO)
        Exit Sub

    End If

    avis = 1
    Dim Obj1 As obj, Obj2 As obj
    Dim OtroUserIndex As Integer
    Dim TerminarAhora As Boolean

    TerminarAhora = False
    OtroUserIndex = UserList(Userindex).ComUsu.DestUsu

    'pluto:2.10
    If UserList(Userindex).ComUsu.Objeto = FLAGORO And UserList(OtroUserIndex).ComUsu.Objeto = FLAGORO Then
        Call SendData(ToIndex, Userindex, 0, "||No podéis intercambiar Oro" & "´" & FontTypeNames.FONTTYPE_COMERCIO)
        Call SendData(ToIndex, OtroUserIndex, 0, "||No podéis intercambiar Oro" & "´" & FontTypeNames.FONTTYPE_COMERCIO)
        TerminarAhora = True
        GoTo fuera

    End If

    '[Alejo]: Creo haber podido erradicar el bug de
    '         no poder comerciar con mas de 32k de oro.
    '         Las lineas comentadas en los siguientes
    '         2 grandes bloques IF (4 lineas) son las
    '         que originaban el problema.

    If UserList(Userindex).ComUsu.Objeto = FLAGORO Then
        'Obj1.Amount = UserList(UserIndex).ComUsu.Cant
        Obj1.ObjIndex = iORO

        'If Obj1.Amount > UserList(UserIndex).Stats.GLD Then
        If UserList(Userindex).ComUsu.Cant > UserList(Userindex).Stats.GLD Then
            Call SendData(ToIndex, Userindex, 0, "||No tienes esa cantidad." & "´" & FontTypeNames.FONTTYPE_COMERCIO)
            TerminarAhora = True

        End If

    Else
        'pluto:2.7.0
        avis = 2
        Dim chorizo As Integer
        chorizo = UserList(Userindex).Invent.Object(UserList(Userindex).ComUsu.Objeto).ObjIndex

        Obj1.Amount = UserList(Userindex).ComUsu.Cant
        Obj1.ObjIndex = UserList(Userindex).Invent.Object(UserList(Userindex).ComUsu.Objeto).ObjIndex

        If Obj1.Amount > UserList(Userindex).Invent.Object(UserList(Userindex).ComUsu.Objeto).Amount Then
            Call SendData(ToIndex, Userindex, 0, "||No tienes esa cantidad." & "´" & FontTypeNames.FONTTYPE_COMERCIO)
            TerminarAhora = True

        End If

    End If

    avis = 3

    If UserList(OtroUserIndex).ComUsu.Objeto = FLAGORO Then
        'Obj2.Amount = UserList(OtroUserIndex).ComUsu.Cant
        Obj2.ObjIndex = iORO

        'If Obj2.Amount > UserList(OtroUserIndex).Stats.GLD Then
        If UserList(OtroUserIndex).ComUsu.Cant > UserList(OtroUserIndex).Stats.GLD Then
            Call SendData(ToIndex, OtroUserIndex, 0, "||No tienes esa cantidad." & "´" & _
                                                     FontTypeNames.FONTTYPE_COMERCIO)
            TerminarAhora = True

        End If

        'pluto:2.7.0
        If UserList(Userindex).Invent.Object(UserList(Userindex).ComUsu.Objeto).Equipped = 1 Then
            Call SendData(ToIndex, Userindex, 0, "||Tienes ese objeto Equipado" & "´" & FontTypeNames.FONTTYPE_COMERCIO)
            Call SendData(ToIndex, OtroUserIndex, 0, "||El otro user tiene ese objeto Equipado." & "´" & _
                                                     FontTypeNames.FONTTYPE_COMERCIO)
            TerminarAhora = True

        End If

        Dim i2 As Byte
        i2 = 0

        For ii = 1 To MAX_INVENTORY_SLOTS

            If UserList(Userindex).Invent.Object(ii).ObjIndex = 0 Then i2 = i2 + 1
        Next ii

        If i2 < 2 Then
            TerminarAhora = True
            Call Encarcelar(Userindex, 30)
            Call LogCasino("/CARCEL AUTOMATICO COMERCIO" & UserList(Userindex).Name)

        End If

        avis = 4
    Else
        'pluto:2.7.0
        Dim chorizo2 As Integer
        chorizo2 = UserList(OtroUserIndex).Invent.Object(UserList(OtroUserIndex).ComUsu.Objeto).ObjIndex

        Obj2.Amount = UserList(OtroUserIndex).ComUsu.Cant
        Obj2.ObjIndex = UserList(OtroUserIndex).Invent.Object(UserList(OtroUserIndex).ComUsu.Objeto).ObjIndex

        If Obj2.Amount > UserList(OtroUserIndex).Invent.Object(UserList(OtroUserIndex).ComUsu.Objeto).Amount Then
            Call SendData(ToIndex, OtroUserIndex, 0, "||No tienes esa cantidad." & "´" & _
                                                     FontTypeNames.FONTTYPE_COMERCIO)
            TerminarAhora = True

        End If

        If UserList(OtroUserIndex).ComUsu.Objeto = FLAGORO Then GoTo ee

        'pluto:2.7.0
        If UserList(OtroUserIndex).Invent.Object(UserList(OtroUserIndex).ComUsu.Objeto).Equipped = 1 Then
            Call SendData(ToIndex, OtroUserIndex, 0, "||Tienes ese objeto Equipado" & "´" & _
                                                     FontTypeNames.FONTTYPE_COMERCIO)
            Call SendData(ToIndex, Userindex, 0, "||El otro user tiene ese objeto Equipado." & "´" & _
                                                 FontTypeNames.FONTTYPE_COMERCIO)
            TerminarAhora = True

        End If

        'pluto:2.9.0
        Dim i1 As Byte
        avis = 5
        i1 = 0

        For ii = 1 To MAX_INVENTORY_SLOTS

            If UserList(OtroUserIndex).Invent.Object(ii).ObjIndex = 0 Then i1 = i1 + 1
        Next ii

        If i1 < 2 Then
            TerminarAhora = True
            Call Encarcelar(OtroUserIndex, 30)
            Call LogCasino("/CARCEL AUTOMATICO COMERCIO" & UserList(OtroUserIndex).Name)

        End If

        'pluto:2.9.0
ee:

        If UserList(Userindex).ComUsu.Objeto = FLAGORO Then GoTo ee2
        If UserList(Userindex).Invent.Object(UserList(Userindex).ComUsu.Objeto).Equipped = 1 Then
            Call SendData(ToIndex, Userindex, 0, "||Tienes ese objeto Equipado" & "´" & FontTypeNames.FONTTYPE_COMERCIO)
            Call SendData(ToIndex, OtroUserIndex, 0, "||El otro user tiene ese objeto Equipado." & "´" & _
                                                     FontTypeNames.FONTTYPE_COMERCIO)
            TerminarAhora = True

        End If

ee2:

    End If

    avis = 6

    'PLuto:2.10
    If (chorizo > 887 And chorizo < 900) And (chorizo2 > 887 And chorizo2 < 900) Then
        Call SendData(ToIndex, Userindex, 0, "||No se puede comerciar una mascota por otra." & "´" & _
                                             FontTypeNames.FONTTYPE_COMERCIO)
        Call SendData(ToIndex, OtroUserIndex, 0, "||No se puede comerciar una mascota por otra." & "´" & _
                                                 FontTypeNames.FONTTYPE_COMERCIO)
        TerminarAhora = True

    End If

    'pluto:2.14
    If ObjData(Obj1.ObjIndex).Caos > 0 Or ObjData(Obj1.ObjIndex).Real > 0 Or ObjData(Obj2.ObjIndex).Real > 0 Or _
       ObjData(Obj2.ObjIndex).Caos > 0 Then
        Call SendData(ToIndex, Userindex, 0, "||No se puede comerciar con Ropas de Armadas." & "´" & _
                                             FontTypeNames.FONTTYPE_COMERCIO)
        Call SendData(ToIndex, OtroUserIndex, 0, "||No se puede comerciar con Ropas de Armadas." & "´" & _
                                                 FontTypeNames.FONTTYPE_COMERCIO)
        TerminarAhora = True

    End If

    'pluto:2.15
    If (chorizo > 887 And chorizo < 900) Then
        If UserList(Userindex).Montura.Elu(chorizo - 887) = 0 Then
            Call SendData(ToGM, 0, 0, "|| Comercio Mascota Bugueada: " & UserList(Userindex).Name & "´" & _
                                      FontTypeNames.FONTTYPE_COMERCIO)
            Call LogMascotas("BUG comercioMASCOTA Serie: " & UserList(Userindex).Serie & " IP: " & UserList( _
                             Userindex).ip & " Nom: " & UserList(Userindex).Name)

            TerminarAhora = True

        End If

    End If

    If (chorizo2 > 887 And chorizo2 < 900) Then
        If UserList(OtroUserIndex).Montura.Elu(chorizo2 - 887) = 0 Then
            Call SendData(ToGM, 0, 0, "|| Comercio Mascota Bugueada: " & UserList(OtroUserIndex).Name & "´" & _
                                      FontTypeNames.FONTTYPE_COMERCIO)
            Call LogMascotas("BUG comercioMASCOTA Serie: " & UserList(OtroUserIndex).Serie & " IP: " & UserList( _
                             OtroUserIndex).ip & " Nom: " & UserList(OtroUserIndex).Name)

            TerminarAhora = True

        End If

    End If

    '-----------------------
    'pluto:6.0A
    'If UserList(UserIndex).Nmonturas > 2 Or UserList(OtroUserIndex).Nmonturas > 2 Then
    'Call SendData(ToIndex, UserIndex, 0, "||No se puede tener más de Tres Mascotas." & "´" & FontTypeNames.FONTTYPE_COMERCIO)
    'Call SendData(ToIndex, OtroUserIndex, 0, "||No se puede tener más de Tres Mascotas." & "´" & FontTypeNames.FONTTYPE_COMERCIO)
    'TerminarAhora = True
    'End If

fuera:

    'Por si las moscas...
    If TerminarAhora = True Then
        Call FinComerciarUsu(Userindex)
        Call FinComerciarUsu(OtroUserIndex)
        Exit Sub

    End If

    'pluto:2.7.0

    '---jugador 1-----
    If chorizo > 887 And chorizo < 900 Then
        avis = 7
        Dim UserFile As String
        Dim userfile2 As String
        UserFile = CharPath & Left$(UserList(Userindex).Name, 1) & "\" & UserList(Userindex).Name & ".chr"
        userfile2 = CharPath & Left$(UserList(OtroUserIndex).Name, 1) & "\" & UserList(OtroUserIndex).Name & ".chr"
        Dim n As Byte

        For n = 1 To 3

            If val(GetVar(userfile2, "MONTURA" & n, "TIPO")) = chorizo - 887 Then
                Call SendData(ToIndex, Userindex, 0, "||Ese Pj ya tiene ese tipo de Mascota." & "´" & _
                                                     FontTypeNames.FONTTYPE_COMERCIO)
                Call SendData(ToIndex, OtroUserIndex, 0, "||Ya tienes ese tipo de Mascota." & "´" & _
                                                         FontTypeNames.FONTTYPE_COMERCIO)
                Call FinComerciarUsu(Userindex)
                Call FinComerciarUsu(OtroUserIndex)
                Exit Sub

            End If

        Next n

        'pluto:6.0A
        If UserList(OtroUserIndex).Nmonturas > 2 Then
            Call SendData(ToIndex, Userindex, 0, "||Ese Personaje ya tiene Tres Mascotas." & "´" & _
                                                 FontTypeNames.FONTTYPE_COMERCIO)
            Call SendData(ToIndex, OtroUserIndex, 0, "||No se puede tener más de Tres Mascotas." & "´" & _
                                                     FontTypeNames.FONTTYPE_COMERCIO)
            Call FinComerciarUsu(Userindex)
            Call FinComerciarUsu(OtroUserIndex)
            Exit Sub

        End If

        'If val(GetVar(userfile2, "MONTURA", "NIVEL" & chorizo - 887)) > 0 Then
        'Call SendData(ToIndex, Userindex, 0, "||Ese Pj ya tiene ese tipo de Mascota." & FONTTYPENAMES.FONTTYPE_COMERCIO)
        'Call SendData(ToIndex, OtroUserIndex, 0, "||Ya tienes ese tipo de Mascota." & FONTTYPENAMES.FONTTYPE_COMERCIO)
        'Call FinComerciarUsu(Userindex)
        'Call FinComerciarUsu(OtroUserIndex)
        'Exit Sub
        'End If

        'Dim xx, x1, x2, x3, x4, x5 As Integer
        Dim x1 As Byte
        Dim x2 As Long
        Dim x3 As Long
        Dim x4 As Integer
        Dim x5 As Integer
        Dim xx As Integer
        Dim x6 As String
        'pluto:6.0A
        Dim x7 As Byte
        Dim x8 As Byte
        Dim x9 As Byte
        Dim x10 As Byte
        Dim x11 As Byte
        Dim x12 As Byte
        Dim x13 As Byte
        Dim x14 As Byte
        Dim x15 As Byte
        Dim x16 As Byte
        xx = chorizo - 887
        x1 = UserList(Userindex).Montura.Nivel(xx)
        x2 = UserList(Userindex).Montura.exp(xx)
        x3 = UserList(Userindex).Montura.Elu(xx)
        x4 = UserList(Userindex).Montura.Vida(xx)
        x5 = UserList(Userindex).Montura.Golpe(xx)
        x6 = UserList(Userindex).Montura.Nombre(xx)
        x7 = UserList(Userindex).Montura.AtCuerpo(xx)
        x8 = UserList(Userindex).Montura.Defcuerpo(xx)
        x9 = UserList(Userindex).Montura.AtFlechas(xx)
        x10 = UserList(Userindex).Montura.DefFlechas(xx)
        x11 = UserList(Userindex).Montura.AtMagico(xx)
        x12 = UserList(Userindex).Montura.DefMagico(xx)
        x13 = UserList(Userindex).Montura.Evasion(xx)
        x14 = UserList(Userindex).Montura.Libres(xx)
        x15 = UserList(Userindex).Montura.Tipo(xx)

        x16 = UserList(Userindex).Montura.index(xx)

        Call LogMascotas("Comercio " & UserList(Userindex).Name & " ofrece Mascota: " & x6 & " tiene " & UserList( _
                         Userindex).Nmonturas)
        Call LogMascotas("Comercio " & UserList(OtroUserIndex).Name & " acepta Mascota: " & x6 & " tiene " & UserList( _
                         OtroUserIndex).Nmonturas)

        'tomamos valores del user1 al user2 excepto el index (x16)
        UserList(OtroUserIndex).Montura.Nivel(xx) = val(x1)
        UserList(OtroUserIndex).Montura.exp(xx) = val(x2)
        UserList(OtroUserIndex).Montura.Elu(xx) = val(x3)
        UserList(OtroUserIndex).Montura.Vida(xx) = val(x4)
        UserList(OtroUserIndex).Montura.Golpe(xx) = val(x5)
        UserList(OtroUserIndex).Montura.Nombre(xx) = x6
        UserList(OtroUserIndex).Montura.AtCuerpo(xx) = val(x7)
        UserList(OtroUserIndex).Montura.Defcuerpo(xx) = val(x8)
        UserList(OtroUserIndex).Montura.AtFlechas(xx) = val(x9)
        UserList(OtroUserIndex).Montura.DefFlechas(xx) = val(x10)
        UserList(OtroUserIndex).Montura.AtMagico(xx) = val(x11)
        UserList(OtroUserIndex).Montura.DefMagico(xx) = val(x12)
        UserList(OtroUserIndex).Montura.Evasion(xx) = val(x13)
        UserList(OtroUserIndex).Montura.Libres(xx) = val(x14)
        UserList(OtroUserIndex).Montura.Tipo(xx) = val(x15)

        'buscamos el index
        For n = 1 To 3

            If val(GetVar(userfile2, "MONTURA" & n, "TIPO")) = 0 Then GoTo gb
        Next
        Call LogMascotas("Comercio NO INDEX LIBRE en " & UserList(OtroUserIndex).Name)
gb:
        'guardamos el index pero no hace falta grabarlo
        UserList(OtroUserIndex).Montura.index(xx) = n
        Call LogMascotas("Comercio metemos en INDEX: " & n & " una Mascota: " & x6 & " al user " & UserList( _
                         OtroUserIndex).Name)
        'guardamos en ficha user2
        Call WriteVar(userfile2, "MONTURA" & n, "NIVEL", val(x1))
        Call WriteVar(userfile2, "MONTURA" & n, "EXP", val(x2))
        Call WriteVar(userfile2, "MONTURA" & n, "ELU", val(x3))
        Call WriteVar(userfile2, "MONTURA" & n, "VIDA", val(x4))
        Call WriteVar(userfile2, "MONTURA" & n, "GOLPE", val(x5))
        Call WriteVar(userfile2, "MONTURA" & n, "NOMBRE", x6)
        Call WriteVar(userfile2, "MONTURA" & n, "ATCUERPO", val(x7))
        Call WriteVar(userfile2, "MONTURA" & n, "DEFCUERPO", val(x8))
        Call WriteVar(userfile2, "MONTURA" & n, "ATFLECHAS", val(x9))
        Call WriteVar(userfile2, "MONTURA" & n, "DEFFLECHAS", val(x10))
        Call WriteVar(userfile2, "MONTURA" & n, "ATMAGICO", val(x11))
        Call WriteVar(userfile2, "MONTURA" & n, "DEFMAGICO", val(x12))
        Call WriteVar(userfile2, "MONTURA" & n, "EVASION", val(x13))
        Call WriteVar(userfile2, "MONTURA" & n, "LIBRES", val(x14))
        Call WriteVar(userfile2, "MONTURA" & n, "TIPO", val(x15))

        'ponemos a cero la mascota del user1
        Call ResetMontura(Userindex, xx)
        'ponemos a cero la ficha mascota user 1
        Call WriteVar(UserFile, "MONTURA" & x16, "NIVEL", 0)
        Call WriteVar(UserFile, "MONTURA" & x16, "EXP", 0)
        Call WriteVar(UserFile, "MONTURA" & x16, "ELU", 0)
        Call WriteVar(UserFile, "MONTURA" & x16, "VIDA", 0)
        Call WriteVar(UserFile, "MONTURA" & x16, "GOLPE", 0)
        Call WriteVar(UserFile, "MONTURA" & x16, "NOMBRE", "")
        Call WriteVar(UserFile, "MONTURA" & x16, "ATCUERPO", 0)
        Call WriteVar(UserFile, "MONTURA" & x16, "DEFCUERPO", 0)
        Call WriteVar(UserFile, "MONTURA" & x16, "ATFLECHAS", 0)
        Call WriteVar(UserFile, "MONTURA" & x16, "DEFFLECHAS", 0)
        Call WriteVar(UserFile, "MONTURA" & x16, "ATMAGICO", 0)
        Call WriteVar(UserFile, "MONTURA" & x16, "DEFMAGICO", 0)
        Call WriteVar(UserFile, "MONTURA" & x16, "EVASION", 0)
        Call WriteVar(UserFile, "MONTURA" & x16, "LIBRES", 0)
        Call WriteVar(UserFile, "MONTURA" & x16, "TIPO", 0)
        Call LogMascotas("Comercio INDEX : " & x16 & " a cero en " & UserList(Userindex).Name)

        'sumamos y restamos mascotas
        UserList(Userindex).Nmonturas = UserList(Userindex).Nmonturas - 1
        UserList(OtroUserIndex).Nmonturas = UserList(OtroUserIndex).Nmonturas + 1
        Call WriteVar(UserFile, "MONTURAS", "NroMonturas", val(UserList(Userindex).Nmonturas))
        Call WriteVar(userfile2, "MONTURAS", "NroMonturas", val(UserList(OtroUserIndex).Nmonturas))
        Call LogMascotas("Comercio " & UserList(Userindex).Name & " resta 1 y ahora tiene " & UserList( _
                         Userindex).Nmonturas)
        Call LogMascotas("Comercio " & UserList(OtroUserIndex).Name & " suma 1 y ahora tiene " & UserList( _
                         OtroUserIndex).Nmonturas)

    End If    'jugador 1

    '---jugador 2-----
    If chorizo2 > 887 And chorizo2 < 900 Then
        avis = 8
        userfile2 = CharPath & Left$(UserList(OtroUserIndex).Name, 1) & "\" & UserList(OtroUserIndex).Name & ".chr"
        UserFile = CharPath & Left$(UserList(Userindex).Name, 1) & "\" & UserList(Userindex).Name & ".chr"

        For n = 1 To 3

            If val(GetVar(UserFile, "MONTURA" & n, "TIPO")) = chorizo2 - 887 Then
                Call SendData(ToIndex, OtroUserIndex, 0, "||Ese Pj ya tiene ese tipo de Mascota." & "´" & _
                                                         FontTypeNames.FONTTYPE_COMERCIO)
                Call SendData(ToIndex, Userindex, 0, "||Ya tienes ese tipo de Mascota." & "´" & _
                                                     FontTypeNames.FONTTYPE_COMERCIO)
                Call FinComerciarUsu(Userindex)
                Call FinComerciarUsu(OtroUserIndex)
                Exit Sub

            End If

        Next n

        'pluto:6.0A
        If UserList(Userindex).Nmonturas > 2 Then
            Call SendData(ToIndex, OtroUserIndex, 0, "||Ese Personaje ya tiene Tres Mascotas." & "´" & _
                                                     FontTypeNames.FONTTYPE_COMERCIO)
            Call SendData(ToIndex, Userindex, 0, "||No se puede tener más de Tres Mascotas." & "´" & _
                                                 FontTypeNames.FONTTYPE_COMERCIO)
            Call FinComerciarUsu(Userindex)
            Call FinComerciarUsu(OtroUserIndex)
            Exit Sub

        End If

        'If val(GetVar(userfile, "MONTURA", "NIVEL" & chorizo2 - 887)) > 0 Then
        'Call SendData(ToIndex, OtroUserIndex, 0, "||Ese Pj ya tiene ese tipo de Mascota." & FONTTYPENAMES.FONTTYPE_COMERCIO)
        'Call SendData(ToIndex, Userindex, 0, "||Ya tienes ese tipo de Mascota." & FONTTYPENAMES.FONTTYPE_COMERCIO)
        'Call FinComerciarUsu(OtroUserIndex)
        'Call FinComerciarUsu(Userindex)
        'Exit Sub
        'End If
        xx = chorizo2 - 887
        x1 = UserList(OtroUserIndex).Montura.Nivel(xx)
        x2 = UserList(OtroUserIndex).Montura.exp(xx)
        x3 = UserList(OtroUserIndex).Montura.Elu(xx)
        x4 = UserList(OtroUserIndex).Montura.Vida(xx)
        x5 = UserList(OtroUserIndex).Montura.Golpe(xx)
        x6 = UserList(OtroUserIndex).Montura.Nombre(xx)
        x7 = UserList(OtroUserIndex).Montura.AtCuerpo(xx)
        x8 = UserList(OtroUserIndex).Montura.Defcuerpo(xx)
        x9 = UserList(OtroUserIndex).Montura.AtFlechas(xx)
        x10 = UserList(OtroUserIndex).Montura.DefFlechas(xx)
        x11 = UserList(OtroUserIndex).Montura.AtMagico(xx)
        x12 = UserList(OtroUserIndex).Montura.DefMagico(xx)
        x13 = UserList(OtroUserIndex).Montura.Evasion(xx)
        x14 = UserList(OtroUserIndex).Montura.Libres(xx)
        x15 = UserList(OtroUserIndex).Montura.Tipo(xx)

        x16 = UserList(OtroUserIndex).Montura.index(xx)

        UserList(Userindex).Montura.Nivel(xx) = val(x1)
        UserList(Userindex).Montura.exp(xx) = val(x2)
        UserList(Userindex).Montura.Elu(xx) = val(x3)
        UserList(Userindex).Montura.Vida(xx) = val(x4)
        UserList(Userindex).Montura.Golpe(xx) = val(x5)
        UserList(Userindex).Montura.Nombre(xx) = x6
        UserList(Userindex).Montura.AtCuerpo(xx) = val(x7)
        UserList(Userindex).Montura.Defcuerpo(xx) = val(x8)
        UserList(Userindex).Montura.AtFlechas(xx) = val(x9)
        UserList(Userindex).Montura.DefFlechas(xx) = val(x10)
        UserList(Userindex).Montura.AtMagico(xx) = val(x11)
        UserList(Userindex).Montura.DefMagico(xx) = val(x12)
        UserList(Userindex).Montura.Evasion(xx) = val(x13)
        UserList(Userindex).Montura.Libres(xx) = val(x14)
        UserList(Userindex).Montura.Tipo(xx) = val(x15)

        'buscamos el index
        For n = 1 To 3

            If val(GetVar(UserFile, "MONTURA" & n, "TIPO")) = 0 Then GoTo gb2
        Next
        Call LogMascotas("Comercio NO INDEX LIBRE en " & UserList(Userindex).Name)
gb2:

        'guardamos el index pero no hace falta grabarlo
        UserList(Userindex).Montura.index(xx) = n
        Call LogMascotas("Comercio metemos en INDEX: " & n & " una Mascota: " & x6 & " al user " & UserList( _
                         Userindex).Name)
        'guardamos en ficha user1
        Call WriteVar(UserFile, "MONTURA" & n, "NIVEL", val(x1))
        Call WriteVar(UserFile, "MONTURA" & n, "EXP", val(x2))
        Call WriteVar(UserFile, "MONTURA" & n, "ELU", val(x3))
        Call WriteVar(UserFile, "MONTURA" & n, "VIDA", val(x4))
        Call WriteVar(UserFile, "MONTURA" & n, "GOLPE", val(x5))
        Call WriteVar(UserFile, "MONTURA" & n, "NOMBRE", x6)
        Call WriteVar(UserFile, "MONTURA" & n, "ATCUERPO", val(x7))
        Call WriteVar(UserFile, "MONTURA" & n, "DEFCUERPO", val(x8))
        Call WriteVar(UserFile, "MONTURA" & n, "ATFLECHAS", val(x9))
        Call WriteVar(UserFile, "MONTURA" & n, "DEFFLECHAS", val(x10))
        Call WriteVar(UserFile, "MONTURA" & n, "ATMAGICO", val(x11))
        Call WriteVar(UserFile, "MONTURA" & n, "DEFMAGICO", val(x12))
        Call WriteVar(UserFile, "MONTURA" & n, "EVASION", val(x13))
        Call WriteVar(UserFile, "MONTURA" & n, "LIBRES", val(x14))
        Call WriteVar(UserFile, "MONTURA" & n, "TIPO", val(x15))

        'ponermos a cero user2
        Call ResetMontura(OtroUserIndex, xx)

        'ponemos a cero ficha user2

        Call WriteVar(userfile2, "MONTURA" & x16, "NIVEL", 0)
        Call WriteVar(userfile2, "MONTURA" & x16, "EXP", 0)
        Call WriteVar(userfile2, "MONTURA" & x16, "ELU", 0)
        Call WriteVar(userfile2, "MONTURA" & x16, "VIDA", 0)
        Call WriteVar(userfile2, "MONTURA" & x16, "GOLPE", 0)
        Call WriteVar(userfile2, "MONTURA" & x16, "NOMBRE", "")
        Call WriteVar(userfile2, "MONTURA" & x16, "ATCUERPO", 0)
        Call WriteVar(userfile2, "MONTURA" & x16, "DEFCUERPO", 0)
        Call WriteVar(userfile2, "MONTURA" & x16, "ATFLECHAS", 0)
        Call WriteVar(userfile2, "MONTURA" & x16, "DEFFLECHAS", 0)
        Call WriteVar(userfile2, "MONTURA" & x16, "ATMAGICO", 0)
        Call WriteVar(userfile2, "MONTURA" & x16, "DEFMAGICO", 0)
        Call WriteVar(userfile2, "MONTURA" & x16, "EVASION", 0)
        Call WriteVar(userfile2, "MONTURA" & x16, "LIBRES", 0)
        Call WriteVar(userfile2, "MONTURA" & x16, "TIPO", 0)
        Call LogMascotas("Comercio INDEX : " & x16 & " a cero en " & UserList(OtroUserIndex).Name)

        'sumamos y restamos mascotas
        'If UserList(OtroUserIndex).Nmonturas < 1 Then GoTo noo
        UserList(OtroUserIndex).Nmonturas = UserList(OtroUserIndex).Nmonturas - 1
noo:
        UserList(Userindex).Nmonturas = UserList(Userindex).Nmonturas + 1
        Call WriteVar(userfile2, "MONTURAS", "NroMonturas", val(UserList(OtroUserIndex).Nmonturas))
        Call WriteVar(UserFile, "MONTURAS", "NroMonturas", val(UserList(Userindex).Nmonturas))

        Call LogMascotas("Comercio " & UserList(OtroUserIndex).Name & " resta 1 y ahora tiene " & UserList( _
                         OtroUserIndex).Nmonturas)
        Call LogMascotas("Comercio " & UserList(Userindex).Name & " suma 1 y ahora tiene " & UserList( _
                         Userindex).Nmonturas)

    End If    'jugador 2

    '[CORREGIDO]
    'Desde acá corregí el bug que cuando se ofrecian mas de
    '10k de oro no le llegaban al destinatario.
    avis = 9

    'pone el oro directamente en la billetera
    If UserList(OtroUserIndex).ComUsu.Objeto = FLAGORO Then
        'quito la cantidad de oro ofrecida
        UserList(OtroUserIndex).Stats.GLD = UserList(OtroUserIndex).Stats.GLD - UserList(OtroUserIndex).ComUsu.Cant
        Call SendUserStatsOro(OtroUserIndex)
        'y se la doy al otro
        'UserList(UserIndex).Stats.GLD = UserList(UserIndex).Stats.GLD + UserList(OtroUserIndex).ComUsu.Cant
        Call AddtoVar(UserList(Userindex).Stats.GLD, UserList(OtroUserIndex).ComUsu.Cant, MAXORO)
        Call SendUserStatsOro(Userindex)
    Else

        'Quita el objeto y se lo da al otro
        If MeterItemEnInventario(Userindex, Obj2) = False Then
            Call TirarItemAlPiso(UserList(Userindex).Pos, Obj2)

        End If

        Call QuitarObjetos(Obj2.ObjIndex, Obj2.Amount, OtroUserIndex)

    End If

    avis = 10

    'pone el oro directamente en la billetera
    If UserList(Userindex).ComUsu.Objeto = FLAGORO Then
        'quito la cantidad de oro ofrecida
        UserList(Userindex).Stats.GLD = UserList(Userindex).Stats.GLD - UserList(Userindex).ComUsu.Cant
        Call SendUserStatsOro(Userindex)
        'y se la doy al otro
        'UserList(OtroUserIndex).Stats.GLD = UserList(OtroUserIndex).Stats.GLD + UserList(UserIndex).ComUsu.Cant
        Call AddtoVar(UserList(OtroUserIndex).Stats.GLD, UserList(Userindex).ComUsu.Cant, MAXORO)

        Call SendUserStatsOro(OtroUserIndex)
    Else

        'Quita el objeto y se lo da al otro
        If MeterItemEnInventario(OtroUserIndex, Obj1) = False Then
            Call TirarItemAlPiso(UserList(OtroUserIndex).Pos, Obj2)

        End If

        Call QuitarObjetos(Obj1.ObjIndex, Obj1.Amount, Userindex)

    End If

    avis = 11
    '[/CORREGIDO] :p

    Call UpdateUserInv(True, Userindex, 0)
    Call UpdateUserInv(True, OtroUserIndex, 0)

    Call FinComerciarUsu(Userindex)
    Call FinComerciarUsu(OtroUserIndex)

    Exit Sub
errhandler:
    Call LogError("aceptarcomerciousu " & UserList(Userindex).Name & " y " & UserList(OtroUserIndex).Name & " Obj: " _
                  & Obj1.ObjIndex & " / " & Obj2.ObjIndex & " Cant: " & Obj1.Amount & " / " & Obj2.Amount & " " & avis)

End Sub

'[/Alejo]

