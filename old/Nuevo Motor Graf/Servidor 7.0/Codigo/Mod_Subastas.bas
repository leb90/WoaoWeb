Attribute VB_Name = "Mod_Subastas"

Option Explicit

Type S

    HaySubastas As Boolean
    Vendedor As Integer
    comprador As Integer
    oferta As Long
    ItemEnVenta As Integer
    CantidadVenta As Integer
    VendedorQuisoSalir As Byte
    CompradorQuisoSalir As Byte

End Type

Public Const NPCSubastas As Byte = 55
Public Const Duracion_Subasta As Byte = 3
Public Subastas As S

Public SegundosSubasta As Byte
Public MinutosSubasta As Byte

Sub PasarMinutoSubasta()

    If Subastas.HaySubastas = True Then
        MinutosSubasta = MinutosSubasta + 1

        If MinutosSubasta = (Duracion_Subasta) Then
            TerminarSubasta
            MinutosSubasta = 0
        Else

            If Subastas.comprador = 0 Then
                SendData ToAll, 0, 0, "||El usuario " & UserList(Subastas.Vendedor).Name & " esta subastando " & _
                                      Subastas.CantidadVenta & " " & ObjData(Subastas.ItemEnVenta).Name & _
                                      " a un precio inicial de " & Subastas.oferta & "." & "´" & FontTypeNames.FONTTYPE_pluto
            Else
                SendData ToAll, 0, 0, "||El usuario " & UserList(Subastas.Vendedor).Name & " esta subastando " & _
                                      Subastas.CantidadVenta & " " & ObjData(Subastas.ItemEnVenta).Name & " a un precio de " & _
                                      Subastas.oferta & "." & "´" & FontTypeNames.FONTTYPE_pluto

            End If

            SendData ToAll, 0, 0, "||La Subasta terminara en " & (Duracion_Subasta - MinutosSubasta) & " Minutos." & _
                                  "´" & FontTypeNames.FONTTYPE_pluto

        End If

    End If

End Sub

Sub TerminarSubasta()

    Dim ob As obj

    With Subastas

        ob.Amount = .CantidadVenta
        ob.ObjIndex = .ItemEnVenta

        If .comprador = 0 Then

            '   Call SendData(ToIndex, .Vendedor, 0, "||Nadie respondio a tu subasta" & FONTTYPE_INFO)
            If Not MeterItemEnInventario(.Vendedor, ob) Then Call TirarItemAlPiso(UserList(.Vendedor).Pos, ob)
            SendData ToAll, 0, 0, "||Subasta finalizada." & "´" & FontTypeNames.FONTTYPE_pluto
        Else
            UserList(.Vendedor).Stats.GLD = UserList(.Vendedor).Stats.GLD + (.oferta / 1.11)
            Call SendUserStatsOro(.Vendedor)

            If Not MeterItemEnInventario(.comprador, ob) Then Call TirarItemAlPiso(UserList(.comprador).Pos, ob)
            SendData ToAll, 0, 0, "||La subasta termino, el ganador fue " & UserList(.comprador).Name & _
                                  " a un precio de " & .oferta & " monedas de oro." & "´" & FontTypeNames.FONTTYPE_pluto

        End If

        .HaySubastas = False
        .Vendedor = 0
        .comprador = 0
        .oferta = 0
        .ItemEnVenta = 0
        .CantidadVenta = 0
        .CompradorQuisoSalir = 0
        .VendedorQuisoSalir = 0

        If Subastas.CompradorQuisoSalir = 1 Then CloseSocket Subastas.comprador
        If Subastas.VendedorQuisoSalir = 1 Then CloseSocket Subastas.Vendedor

    End With

End Sub

Sub Subastar(Userindex As Integer, Precioinicial As Long)

    Dim npc As Integer

    npc = UserList(Userindex).flags.TargetNpc

    If npc = 0 Then Exit Sub

    If Npclist(npc).NPCtype <> NPCSubastas Then
        Exit Sub

    End If

    Dim Itemsubastar As Integer
    Dim CantidadItemSubastar As Integer

    Itemsubastar = MapData(UserList(Userindex).Pos.Map, UserList(Userindex).Pos.X, UserList( _
                                                                                   Userindex).Pos.Y).OBJInfo.ObjIndex
    CantidadItemSubastar = MapData(UserList(Userindex).Pos.Map, UserList(Userindex).Pos.X, UserList( _
                                                                                           Userindex).Pos.Y).OBJInfo.Amount

    If Distancia(Npclist(npc).Pos, UserList(Userindex).Pos) > 1 Then
        Call SendData(ToIndex, Userindex, 0, "||Estas Muy Lejos" & "´" & FontTypeNames.FONTTYPE_pluto)
        Exit Sub

    End If

    If CantidadItemSubastar = 0 Then
        SendData ToIndex, Userindex, 0, "||Tira el item q deseas subastar" & "´" & FontTypeNames.FONTTYPE_pluto
        Exit Sub

    End If

    'ObjData (MapData(UserList(Userindex).POS.Map, UserList(Userindex).POS.X, UserList(Userindex).POS.Y).OBJInfo.OBJIndex)
    Dim ob As obj

    EraseObj ToMap, Userindex, UserList(Userindex).Pos.Map, MapData(UserList(Userindex).Pos.Map, UserList( _
                                                                                                 Userindex).Pos.X, UserList(Userindex).Pos.Y).OBJInfo.Amount, UserList(Userindex).Pos.Map, UserList( _
                                                                                                                                                                                           Userindex).Pos.X, UserList(Userindex).Pos.Y


    Subastas.Vendedor = Userindex
    Subastas.ItemEnVenta = Itemsubastar
    Subastas.CantidadVenta = CantidadItemSubastar
    Subastas.oferta = Precioinicial
    Subastas.comprador = 0
    Subastas.oferta = Precioinicial
    SegundosSubasta = 0

    SendData ToAll, 0, 0, "||El usuario " & UserList(Userindex).Name & " esta subastando " & CantidadItemSubastar & _
                          " " & ObjData(Itemsubastar).Name & " a un precio inicial de " & Precioinicial & "." & "´" & _
                          FontTypeNames.FONTTYPE_pluto

    Subastas.HaySubastas = True

End Sub

Sub Ofertar(Userindex As Integer, oferta As Long)

    With Subastas

        If .HaySubastas = False Then
            SendData ToIndex, Userindex, 0, "||No hay ninguna subasta en este momento" & "´" & _
                                            FontTypeNames.FONTTYPE_pluto
            Exit Sub

        End If

        If UserList(Userindex).Name = UserList(Subastas.Vendedor).Name Then
            SendData ToIndex, Userindex, 0, "||No puedes Ofertar en tu subasta" & "´" & FontTypeNames.FONTTYPE_pluto
            Exit Sub

        End If

        If UserList(Userindex).Stats.GLD < oferta Then
            SendData ToIndex, Userindex, 0, "||No tienes esa cantidad" & "´" & FontTypeNames.FONTTYPE_pluto
            Exit Sub

        End If

        If oferta <= .oferta + (.oferta * 10 / 100) Then
            SendData ToIndex, Userindex, 0, "||Tu Oferta debe superar un 10% el valor de " & .oferta & _
                                            " monedas de oro." & "´" & FontTypeNames.FONTTYPE_pluto
            Exit Sub

        End If

        If .comprador <> 0 Then
            UserList(.comprador).Stats.GLD = UserList(.comprador).Stats.GLD + .oferta
            Call SendUserStatsOro(.comprador)

        End If

        Call SendData(ToAll, 0, 0, "||El usuario " & UserList(Userindex).Name & " ha ofertado " & oferta & _
                                   " monedas de oro." & "´" & FontTypeNames.FONTTYPE_pluto)
        .oferta = oferta
        .comprador = Userindex

    End With

    UserList(Userindex).Stats.GLD = UserList(Userindex).Stats.GLD - oferta
    Call SendUserStatsOro(Userindex)

End Sub

