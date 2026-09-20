VERSION 1.0 CLASS
BEGIN
  MultiUse = -1  'True
  Persistable = 0  'NotPersistable
  DataBindingBehavior = 0  'vbNone
  DataSourceBehavior  = 0  'vbNone
  MTSTransactionMode  = 0  'NotAnMTSObject
END
Attribute VB_Name = "clsGrapchicalInventory"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = True
Attribute VB_PredeclaredId = False
Attribute VB_Exposed = False
'*****************************************************
'Graphical inventory for ORE 0.4.1
'Designed and implemented by Juan Martín Sotuyo Dodero (Mark)
'markthebig@hotmail.com
'*****************************************************

'**************************************************************************
'This program is free software; you can redistribute it and/or modify
'it under the terms of the GNU General Public License as published by
'the Free Software Foundation; either version 2 of the License, or
'(at your option) any later version.
'
'This program is distributed in the hope that it will be useful,
'but WITHOUT ANY WARRANTY; without even the implied warranty of
'MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
'Affero General Public License for more details.
'
'You should have received a copy of the GNU General Public License
'along with this program; if not, write to the Free Software
'Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  Solano
'Programado por Mark : asocioacion felices los niños del padre grassi

Option Explicit

Private InventoryOffset            As Long             'Number of lines we scrolled down from topmost
Private InvSelectedItem            As Long             'Currently selected item
Private InvSelectedItemDragAndDrop            As Long
Dim SelectItem As Long

Private ownTilePixelWidth          As Integer
Private ownTilePixelHeight         As Integer

Private startdX                    As Integer
Private startdY                    As Integer

Private ShowValue                  As Boolean
Private ValueFormated              As Boolean
Private ImgContainer               As Boolean

Private FontSize                   As Integer
Private lastTileRow                As Integer
Private pWidth                     As Integer
Private pHeight                    As Integer
Private Src                        As wGL_Rectangle
Private Dirty                      As Boolean
Private Device                     As Integer

Private Inventory()                As Inventory    'User's inventory
Private WithEvents InventoryWindow As PictureBox    'Placeholder where to render the inventory
Attribute InventoryWindow.VB_VarHelpID = -1

Public Sub ScrollInventory(ByVal Up As Boolean)

    '***************************************************
    'Author: Juan Martín Sotuyo Dodero (Maraxus)
    'Last Modify Date: 14/01/2010
    'Scrolls the graphical inventory up / down
    '14/01/2010: ZaMa - Now redraws inventory only if needed
    '***************************************************

    'Only move if there is something to show up /down
    If CanScroll(Up) Then
        InventoryOffset = InventoryOffset + IIf(Up, 1, -1)
        
        'Redraw the inventory if needed
        DrawInventory

    End If

End Sub

Public Function CanScroll(ByVal Up As Boolean)

    '***************************************************
    'Author: ZaMa
    'Last Modify Date: 14/01/2010
    'Determines wether inventory can be scrolled up / down
    '***************************************************
    If Up Then
        CanScroll = (InventoryOffset + (InventoryWindow.ScaleHeight \ ownTilePixelHeight)) * (InventoryWindow.ScaleWidth \ ownTilePixelWidth) < _
                UBound(Inventory)
    Else
        CanScroll = InventoryOffset > 0

    End If
    
End Function

Public Sub SelectGold()

    '***************************************************
    'Author: Juan Martín Sotuyo Dodero (Maraxus)
    'Last Modify Date: 27/07/04
    'Sets the gold as the currently selected item
    '***************************************************
    Dim prevSelectedItem As Long
    
    'Store preivously selected item
    prevSelectedItem = InvSelectedItem
    
    'Select the gold
    InvSelectedItem = FLAGORO
    
    'Redraw old item to deselect it
    If prevSelectedItem <> FLAGORO Then
        Dirty = True

    End If

End Sub

Public Sub DeselectItem()

    '***************************************************
    'Author: ZaMa
    'Last Modify Date: 30/11/2009
    'Deselect the currently selected item
    '***************************************************
    If InvSelectedItem = 0 Then Exit Sub
    
    Dim ClearSlot As Byte
    
    ClearSlot = InvSelectedItem
    
    'Select nothing
    InvSelectedItem = 0
    
    'Redraw old item to deselect it
    Dirty = True

End Sub

Public Sub ChangeSlotItemAmount(ByVal Slot As Byte, ByVal Amount As Long)

    '***************************************************
    'Author: ZaMa
    'Created Date: 30/11/2009
    'Last Modify Date: 09/12/2009 (Budi)
    'Change the amount of the required item, and update the slot.
    '***************************************************
    
    Inventory(Slot).Amount = Amount
    
    'Update Amount
    Dirty = True

End Sub

Public Property Get SelectedItem() As Long

    '***************************************************
    'Author: Juan Martín Sotuyo Dodero (Maraxus)
    'Last Modify Date: 27/07/04
    'Retrieves the selected item index
    '***************************************************
    SelectedItem = InvSelectedItem
    


End Property

Public Property Get MaxHit(ByVal Slot As Byte) As Integer

    '***************************************************
    'Author: Juan Martín Sotuyo Dodero (Maraxus)
    'Last Modify Date: 27/07/04
    'Retrieves the max hit of the selected item
    '***************************************************
    MaxHit = Inventory(Slot).MaxHit

End Property

Public Property Get MinHit(ByVal Slot As Byte) As Integer

    '***************************************************
    'Author: Juan Martín Sotuyo Dodero (Maraxus)
    'Last Modify Date: 27/07/04
    'Retrieves the min hit of the selected item
    '***************************************************
    MinHit = Inventory(Slot).MinHit

End Property

Public Property Get DefMax(ByVal Slot As Byte) As Integer

    '***************************************************
    'Author: Juan Martín Sotuyo Dodero (Maraxus)
    'Last Modify Date: 27/07/04
    'Retrieves the defense of the selected item
    '***************************************************
    DefMax = Inventory(Slot).DefMax

End Property

Public Property Get DefMin(ByVal Slot As Byte) As Integer

    '***************************************************
    'Author: Budi
    'Last Modify Date: 02/1209
    'Retrieves the defense of the selected item
    '***************************************************
    DefMin = Inventory(Slot).DefMin

End Property

Public Property Get GrhIndex(ByVal Slot As Byte) As Long

    '***************************************************
    'Author: Juan Martín Sotuyo Dodero (Maraxus)
    'Last Modify Date: 27/07/04
    'Retrieves the grh index of the selected item
    '***************************************************
    GrhIndex = Inventory(Slot).GrhIndex

End Property

Public Property Get Valor(ByVal Slot As Byte) As Single

    '***************************************************
    'Author: Juan Martín Sotuyo Dodero (Maraxus)
    'Last Modify Date: 27/07/04
    'Retrieves the value of the selected item
    '***************************************************
    Valor = Inventory(Slot).Valor

End Property

Public Property Get Amount(ByVal Slot As Byte) As Long

    '***************************************************
    'Author: Juan Martín Sotuyo Dodero (Maraxus)
    'Last Modify Date: 27/07/04
    'Retrieves the selected item's amount
    '***************************************************
    If Slot = FLAGORO Then
        Amount = UserGLD
    ElseIf Slot >= LBound(Inventory) And Slot <= UBound(Inventory) Then
        Amount = Inventory(Slot).Amount

    End If

End Property

Public Property Get ObjIndex(ByVal Slot As Byte) As Integer

    '***************************************************
    'Author: Juan Martín Sotuyo Dodero (Maraxus)
    'Last Modify Date: 27/07/04
    'Retrieves the selected item's object index
    '***************************************************
    ObjIndex = Inventory(Slot).ObjIndex

End Property

Public Property Get ObjType(ByVal Slot As Byte) As Integer

    '***************************************************
    'Author: Juan Martín Sotuyo Dodero (Maraxus)
    'Last Modify Date: 27/07/04
    'Retrieves the selected item's object type
    '***************************************************
    ObjType = Inventory(Slot).ObjType

End Property

Public Property Get Name(ByVal Slot As Byte) As String

    '***************************************************
    'Author: Juan Martín Sotuyo Dodero (Maraxus)
    'Last Modify Date: 27/07/04
    'Retrieves the selected item's name
    '***************************************************
    Name = Inventory(Slot).Name

End Property

Public Property Get Equipped(ByVal Slot As Byte) As Boolean

    '***************************************************
    'Author: Juan Martín Sotuyo Dodero (Maraxus)
    'Last Modify Date: 27/07/04
    'Retrieves True if the item at the given pos is eqiupped
    '***************************************************
    Equipped = Inventory(Slot).Equipped

End Property

Public Property Get SubTipo(ByVal Slot As Byte) As Integer

    '***************************************************
    'Author: Juan Martín Sotuyo Dodero (Maraxus)
    'Last Modify Date: 27/07/04
    'Retrieves the selected item's subtipo
    '***************************************************
    
    SubTipo = Inventory(Slot).SubTipo

End Property

Public Property Get peso(ByVal Slot As Byte) As Double

    '***************************************************
    'Author: Juan Martín Sotuyo Dodero (Maraxus)
    'Last Modify Date: 27/07/04
    'Retrieves the selected item's peso
    '***************************************************
    
    peso = Inventory(Slot).peso

End Property

Public Property Get MaxObjs() As Byte

    '***************************************************
    'Author: Torres Patricio (Pato)
    'Last Modify Date: 09/16/09
    'Retrieves the capacity of the Inventory
    '***************************************************
    MaxObjs = UBound(Inventory)

End Property

Public Sub SetMaxObjs(ByVal MaxObjs As Byte)

    '***************************************************
    'Author: Torres Patricio (Pato)
    'Last Modify Date: 09/16/09
    'Set the capacity of the Inventary
    '***************************************************
    If UBound(Inventory) = MaxObjs Then Exit Sub
    
    ReDim Preserve Inventory(1 To MaxObjs) As Inventory

End Sub

Public Sub ToggleShowValue(ByVal bShow As Boolean)

    '***************************************************
    'Author: ZaMa
    'Last Modify Date: 11/12
    'Indicates if the amount of the items in the inventory is shown
    '***************************************************
    ShowValue = bShow
    Dirty = True

End Sub

Public Sub ClearAllSlots()

    '***************************************************
    'Author: ZaMa
    'Last Modify Date: 15/03/2011
    'Clear All Slots.
    '***************************************************

    Dim Slot As Long

    For Slot = 1 To UBound(Inventory)
        Call SetItem(Slot, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, vbNullString, 0, 0)
    Next Slot

End Sub

Public Sub SetItem(ByVal Slot As Byte, _
                   ByVal eOBJIndex As Integer, _
                   ByVal eAmount As Long, _
                   ByVal eEquipped As Byte, _
                   ByVal eGrhIndex As Long, _
                   ByVal eObjType As Integer, _
                   ByVal eMaxHit As Integer, _
                   ByVal eMinHit As Integer, _
                   ByVal MaxDef As Integer, _
                   ByVal MinDef As Integer, _
                   ByVal eValor As Single, _
                   ByVal eName As String, _
                   ByVal eSubTipo As Integer, _
                   ByVal ePeso As Double)

    '***************************************************
    'Author: Juan Martín Sotuyo Dodero (Maraxus)
    'Last Modify Date: 12/04/06
    'Sets all data for a given inventory slot
    '***************************************************
    If Slot < 1 Or Slot > UBound(Inventory) Then Exit Sub
    
    With Inventory(Slot)
        .Amount = eAmount
        .DefMax = MaxDef
        .DefMin = MinDef
        .Equipped = eEquipped
        .GrhIndex = eGrhIndex
        .MaxHit = eMaxHit
        .MinHit = eMinHit
        .Name = eName
        .ObjIndex = eOBJIndex
        .ObjType = eObjType
        .Valor = eValor
        .SubTipo = eSubTipo
        .peso = ePeso

    End With

    'Render inventory slot (we don't need to render the whole inventory)
    Dirty = True

End Sub

Private Function ClickItem(ByVal x As Long, ByVal y As Long) As Long

    '***************************************************
    'Author: Juan Martín Sotuyo Dodero (Maraxus)
    'Last Modify Date: 27/07/04
    'Selects the item clicked if it's valid and return's it's index
    '***************************************************
    Dim TempItem As Long
    Dim temp_x   As Long
    Dim temp_y   As Long
    
    temp_x = x \ ownTilePixelWidth
    temp_y = y \ ownTilePixelHeight
    
    TempItem = temp_x + (temp_y + InventoryOffset) * (InventoryWindow.ScaleWidth \ ownTilePixelWidth) + 1
    
    'Make sure it's within limits
    If TempItem <= UBound(Inventory) Then
        ClickItem = TempItem

    End If

End Function

Private Sub DrawInventory()

    '***************************************************
    'Renders the inventory to the given PictureBox
    '***************************************************
    Dim i     As Long
    Dim DestX As Long, DestY As Long
    
    'Clear the inventory window
    Call wGL_Graphic.Use_Device(Device)
    Call wGL_Graphic.Clear(CLEAR_COLOR Or CLEAR_DEPTH Or CLEAR_STENCIL, &H0, 1#, 0)
    Call wGL_Graphic_Renderer.Update_Projection(&H0, InventoryWindow.ScaleWidth, InventoryWindow.ScaleHeight)
    Call SetEffect(False)
    
    Call wGl_Render_Texture(InvBackGround, 0, 0, wGl_Depth(1), pWidth, pHeight, Src, &HFFFFFFFF, 0, False)
    
    For i = 0 To UBound(Inventory) - 1
    
    

        With Inventory(i + 1)
            If Not .GrhIndex And vbMiddleButton Then
                DestX = (i Mod lastTileRow) * ownTilePixelWidth
                DestY = (i \ lastTileRow) * ownTilePixelHeight
                If InvSelectedItemDragAndDrop = (i + 1) Then Call DrawGrhToIndex(2, DestX, DestY, wGl_Depth(3), 0, White)
            End If
            If .GrhIndex Then
            
                DestX = (i Mod lastTileRow) * ownTilePixelWidth
                DestY = (i \ lastTileRow) * ownTilePixelHeight
                    
                'Render the item grh and the amount
                Call DrawGrhToIndex(.GrhIndex, DestX, DestY, wGl_Depth(3), 0, &HFFFFFFFF)
                
                If .Amount > 0 And ShowValue Then Call wGl_Draw_Text(0, FontSize, DestX, DestY, White, FONT_ALIGNMENT_TOP, Replace(CStr(.Amount), _
                        "0000", "0K"))
                    
                ' If equipped we render "E"
                If .Equipped Then
                    Call wGl_Draw_Text(0, FontSize, DestX + 26, DestY + 20, Red, FONT_ALIGNMENT_TOP, "E")
                    Call DrawGrhToIndex(36759, DestX, DestY, wGl_Depth(2), 0, White)
                End If
                    
                ' Render a box around the selected item
                If InvSelectedItem = (i + 1) And ImgContainer Then Call DrawGrhToIndex(2, DestX, DestY, wGl_Depth(3), 0, White)
                
                

            End If
        
        End With

    Next i

    Call wGL_Graphic_Renderer.Flush

End Sub

Public Sub DrawInv()
        
    If Dirty Then
        Call DrawInventory
        Dirty = False
    End If

End Sub

Public Sub Initialize(ByRef InvPic As PictureBox, _
                      ByVal MaxObjs As Byte, _
                      Optional ByVal tFontSize As Integer = 13, _
                      Optional ByVal TileWidth As Integer = 32, _
                      Optional ByVal TileHeight As Integer = 32, _
                      Optional ByVal startX As Integer = 0, _
                      Optional ByVal startY As Integer = 0, _
                      Optional ByVal bImgContainer As Boolean = True, _
                      Optional ByVal bShowText As Boolean = True, _
                      Optional ByVal FormatValue As Boolean = False)
    
    '***************************************************
    'Author: Juan Martín Sotuyo Dodero (Maraxus)
    'Last Modify Date: 03/12/09
    'Sets the reference to the picture box on which to render the inventory
    '03/12/09: I added the optionals args FontSize, TileWidth, TileHeight, startX and startY. (Budi)
    '***************************************************

    Set InventoryWindow = InvPic
    ValueFormated = FormatValue
    
    'Make sure auto-redraw is set to true
    InventoryWindow.AutoRedraw = True
    
    'Set apropiate scale (pixel)
    InventoryWindow.ScaleMode = 3
    
    ReDim Inventory(1 To MaxObjs) As Inventory
    
    ownTilePixelHeight = TileHeight
    ownTilePixelWidth = TileWidth
    startdX = startX
    startdY = startY

    FontSize = tFontSize
    lastTileRow = InvPic.ScaleWidth \ TileWidth
    
    pWidth = InventoryWindow.ScaleWidth
    pHeight = InventoryWindow.ScaleHeight
    
    Src.X1 = 0
    Src.Y1 = 0
    Src.X2 = InventoryWindow.ScaleWidth / 190
    Src.Y2 = InventoryWindow.ScaleHeight / 190
    
    ImgContainer = bImgContainer
    ShowValue = bShowText
  
    If ImgContainer Then InvSelectedItem = ClickItem(1, 1)   'If there is anything there we select the top left item
    
    Device = wGL_Graphic.Create_Device_From_Display(InventoryWindow.hWnd, InventoryWindow.ScaleWidth, InventoryWindow.ScaleHeight)
    Dirty = True

End Sub

Public Sub SetDirty()
    Dirty = True
End Sub

Private Sub InventoryWindow_MouseDown(Button As Integer, Shift As Integer, x As Single, y As Single)
        
    Dim TempItem As Long
    
        'Exit if it got outside the control's area
    If x < 0 Or y < 0 Or x > InventoryWindow.Width Or y > InventoryWindow.Height Then Exit Sub

    'If LoGTeclas = True Then LoGTeclas2 = LoGTeclas2 & " RAT-INV," & Button & "," & X & "," & Y

    If IndiceLabel <> -1 Then
        IndiceLabel = -1
        Call Eliminar_ToolTip

    End If
    
    If Button = vbMiddleButton Then
        TempItem = ClickItem(x, y)

        If Inventory(TempItem).GrhIndex Then
            SelectItem = TempItem
            Exit Sub
        End If
    End If
   
    SelectItem = 0
        
End Sub

Private Sub InventoryWindow_MouseMove(Button As Integer, Shift As Integer, x As Single, y As Single)

    '***************************************************
    'Author: Juan Martín Sotuyo Dodero (Maraxus)
    'Last Modify Date: 27/07/04
    'Implements the mouse move event of the inventory picture box
    'Displays a ToolTip of the item under the mouse
    '***************************************************
    Dim temp_x   As Integer
    Dim temp_y   As Integer
    Dim TempItem As Integer
    
    'Exit if it got outside the control's areanv
    If x < 0 Or y < 0 Or x > InventoryWindow.Width Or y > InventoryWindow.Height Then Exit Sub
  
    temp_x = x \ ownTilePixelWidth
    temp_y = y \ ownTilePixelHeight
        
    TempItem = temp_x + (temp_y + InventoryOffset) * (InventoryWindow.ScaleWidth \ ownTilePixelWidth) + 1
    
    If TempItem <= UBound(Inventory) Then
        InventoryWindow.ToolTipText = Inventory(TempItem).Name

    End If
    
End Sub

Private Sub InventoryWindow_MouseUp(Button As Integer, Shift As Integer, x As Single, y As Single)

    '***************************************************
    'Author: Juan Martín Sotuyo Dodero (Maraxus)
    'Last Modify Date: 27/07/04
    'Implements the mouse up event of the inventory picture box
    'Check outs which item was clicked
    '***************************************************
        
    'Store previously selected item
    Dim prevSelItem As Long
    Dim dropPrevSelItem As Long
    
    'Exit if it got outside the control's area
    If x < 0 Or y < 0 Or x > InventoryWindow.Width Or y > InventoryWindow.Height Then Exit Sub
    
    prevSelItem = InvSelectedItem
    
    If Button = vbMiddleButton Then
        dropPrevSelItem = InvSelectedItemDragAndDrop
        InvSelectedItemDragAndDrop = ClickItem(CInt(x), CInt(y))
    Else
        dropPrevSelItem = 0
        InvSelectedItemDragAndDrop = ClickItem(CInt(x), CInt(y))
    End If
    
    'Get the currently clickced item
    InvSelectedItem = ClickItem(CInt(x), CInt(y))
    
    'drag and drop trucho de lele
    If dropPrevSelItem <> SelectItem And SelectItem <> 0 And dropPrevSelItem <> 0 Then
        Call SendData("TUCU" & dropPrevSelItem & "," & SelectItem)
    End If
    
    'Update needed inventory slots
    If prevSelItem <> InvSelectedItem Then

        If prevSelItem <> 0 And prevSelItem <> FLAGORO Then Dirty = True

        If InvSelectedItem Then Dirty = True

    End If
    
    If (Button = vbRightButton) Then
        frmMain.TimerLabel.Enabled = True

        Dim aux   As Integer
        Dim Lainv As String
        Dim ob    As Integer
        Dim n     As Byte

        aux = InvSelectedItem

        If IndiceLabel <> aux Then
                 
            '------------------------------------------------------------
            Lainv = vbNullString
            'pluto:6.0A
            ob = Inventario.ObjIndex(aux)

            If ob = 0 Then Exit Sub

            If ObjData(ob).MaxHit > 0 Then Lainv = Lainv & vbNewLine & "Máximo Golpe: " & ObjData(ob).MaxHit

            If ObjData(ob).MinHit > 0 Then Lainv = Lainv & vbNewLine & "Mínimo Golpe: " & ObjData(ob).MinHit

            If ObjData(ob).MaxDef > 0 Then Lainv = Lainv & vbNewLine & "Máxima Defensa: " & ObjData(ob).MaxDef

            If ObjData(ob).MinDef > 0 Then Lainv = Lainv & vbNewLine & "Mínima Defensa: " & ObjData(ob).MinDef

            If ObjData(ob).MaxHit > 0 Then

                If ObjData(ob).Apuñala > 0 Then
                    Lainv = Lainv & vbNewLine & "Apuñala: Sí"
                Else
                    Lainv = Lainv & vbNewLine & "Apuñala: No"

                End If

                If ObjData(ob).Envenena > 0 Then
                    Lainv = Lainv & vbNewLine & "Veneno: Sí"
                Else
                    Lainv = Lainv & vbNewLine & "Veneno: No"

                End If

            End If

            If ObjData(ob).Magia > 0 Then Lainv = Lainv & vbNewLine & "Mejora Magias: " & ObjData(ob).Magia & "%"

            If ObjData(ob).MaxModificador > 0 Then Lainv = Lainv & vbNewLine & "Efecto Máximo: " & ObjData(ob).MaxModificador

            If ObjData(ob).MinModificador > 0 Then Lainv = Lainv & vbNewLine & "Efecto Mínimo: " & ObjData(ob).MinModificador

            If ObjData(ob).DuracionEfecto > 0 Then Lainv = Lainv & vbNewLine & "Duración Efecto: " & ObjData(ob).DuracionEfecto

            If ObjData(ob).MinSed > 0 Then Lainv = Lainv & vbNewLine & "Recupera Sed: " & ObjData(ob).MinSed

            If ObjData(ob).MinHam > 0 Then Lainv = Lainv & vbNewLine & "Recupera Hambre: " & ObjData(ob).MinHam

            If ObjData(ob).MinSta > 0 Then Lainv = Lainv & vbNewLine & "Recupera Energía: " & ObjData(ob).MinSta

            If ObjData(ob).MinSkill > 0 Then
                Dim ala As Integer
                ala = ObjData(ob).MinSkill

                If UCase$(UserClase) <> "PIRATA" And UCase$(UserClase) <> "PESCADOR" Then ala = ala * 2
                Lainv = Lainv & vbNewLine & "Skill Mínimo: " & ala

            End If

            If ObjData(ob).objetoespecial > 0 Then

                Select Case ObjData(ob).objetoespecial

                    Case 1
                        Lainv = Lainv & vbNewLine & "Habilidad Mágica: Ahorro 33% Flechas"

                    Case 53
                        Lainv = Lainv & vbNewLine & "Habilidad Mágica: Ahorro 50% Flechas"

                    Case 54
                        Lainv = Lainv & vbNewLine & "Habilidad Mágica: Ahorro 75% Flechas"

                    Case 2
                        Lainv = Lainv & vbNewLine & "Habilidad Mágica: Fuerza +5"

                    Case 3
                        Lainv = Lainv & vbNewLine & "Habilidad Mágica: Fuerza +2"

                    Case 4
                        Lainv = Lainv & vbNewLine & "Habilidad Mágica: Fuerza +3"

                    Case 5
                        Lainv = Lainv & vbNewLine & "Habilidad Mágica: Agilidad +5"

                    Case 6
                        Lainv = Lainv & vbNewLine & "Habilidad Mágica: Agilidad +2"

                    Case 7
                        Lainv = Lainv & vbNewLine & "Habilidad Mágica: Agilidad +3"

                    Case 8
                        Lainv = Lainv & vbNewLine & "Habilidad Mágica: Mana +100"

                    Case 9
                        Lainv = Lainv & vbNewLine & "Habilidad Mágica: Mana +200"

                    Case 10
                        Lainv = Lainv & vbNewLine & "Habilidad Mágica: Mana +300"

                End Select

            End If

            If ObjData(ob).nocaer > 0 Then Lainv = Lainv & vbNewLine & "Habilidad Mágica: No se cae al morir."

            'peso
            Lainv = Lainv & vbNewLine & "Cantidad: " & Inventario.Amount(aux)
            Lainv = Lainv & vbNewLine & "Peso Unidad: " & ObjData(ob).peso & " kg."
            Lainv = Lainv & vbNewLine & "Peso Total: " & ObjData(ob).peso * Inventario.Amount(aux) & " Kg."

            If ObjData(ob).SkArco > 0 And ObjData(ob).proyectil > 0 Then Lainv = Lainv & vbNewLine & "Skill Mínimo: " & ObjData(ob).SkArco

            If ObjData(ob).SkArma > 0 And ObjData(ob).proyectil = 0 Then Lainv = Lainv & vbNewLine & "Skill Mínimo: " & ObjData(ob).SkArma

            If ObjData(ob).Vendible = 0 Then
                Lainv = Lainv & vbNewLine & "Vendible: Sí"
            Else
                Lainv = Lainv & vbNewLine & "Vendible: No"

            End If

            If ObjData(ob).razaelfa > 0 Then Lainv = Lainv & vbNewLine & "Raza: Elfos."

            If ObjData(ob).RazaEnana > 0 Then Lainv = Lainv & vbNewLine & "Raza: Enanos."

            If ObjData(ob).razahumana > 0 Then Lainv = Lainv & vbNewLine & "Raza: Humanos."

            If ObjData(ob).razaorca > 0 Then Lainv = Lainv & vbNewLine & "Raza: Orcos."

            If ObjData(ob).razavampiro > 0 Then Lainv = Lainv & vbNewLine & "Raza: Vampiros."

            If ObjData(ob).Real > 0 Then Lainv = Lainv & vbNewLine & "Armada: Armada Real."

            If ObjData(ob).Caos > 0 Then Lainv = Lainv & vbNewLine & "Armada: Armada del Caos."

            If ObjData(ob).Hombre > 0 Then Lainv = Lainv & vbNewLine & "Sexo: Hombres."

            If ObjData(ob).Mujer > 0 Then Lainv = Lainv & vbNewLine & "Sexo: Mujeres."

            If ObjData(ob).ObjetoClan <> "" Then Lainv = Lainv & vbNewLine & "Clan: " & ObjData(ob).ObjetoClan

            If ObjData(ob).HechizoIndex > 0 Then
                Dim afeti As String
                Lainv = Lainv & vbNewLine & "Skill de Magia Necesario: " & Hechizos(ObjData(ob).HechizoIndex).MinSkill
                Lainv = Lainv & vbNewLine & "Mana Necesario: " & Hechizos(ObjData(ob).HechizoIndex).ManaRequerido

                If Hechizos(ObjData(ob).HechizoIndex).MaxHP > 0 Then Lainv = Lainv & vbNewLine & "P.Máximo: " & Hechizos(ObjData( _
                        ob).HechizoIndex).MaxHP

                If Hechizos(ObjData(ob).HechizoIndex).MinHP > 0 Then Lainv = Lainv & vbNewLine & "P.Mínimo: " & Hechizos(ObjData( _
                        ob).HechizoIndex).MinHP

                If Hechizos(ObjData(ob).HechizoIndex).MaxFuerza > 0 Then Lainv = Lainv & vbNewLine & "F.Máximo: " & Hechizos(ObjData( _
                        ob).HechizoIndex).MaxFuerza

                If Hechizos(ObjData(ob).HechizoIndex).MinFuerza > 0 Then Lainv = Lainv & vbNewLine & "F.Mínimo: " & Hechizos(ObjData( _
                        ob).HechizoIndex).MinFuerza

                If Hechizos(ObjData(ob).HechizoIndex).MaxAgilidad > 0 Then Lainv = Lainv & vbNewLine & "A.Máximo: " & Hechizos(ObjData( _
                        ob).HechizoIndex).MaxAgilidad

                If Hechizos(ObjData(ob).HechizoIndex).MinAgilidad > 0 Then Lainv = Lainv & vbNewLine & "A.Mínimo: " & Hechizos(ObjData( _
                        ob).HechizoIndex).MinAgilidad

                If Hechizos(ObjData(ob).HechizoIndex).MaxHam > 0 Then Lainv = Lainv & vbNewLine & "H.Máximo: " & Hechizos(ObjData( _
                        ob).HechizoIndex).MaxHam

                If Hechizos(ObjData(ob).HechizoIndex).MinHam > 0 Then Lainv = Lainv & vbNewLine & "H.Mínimo: " & Hechizos(ObjData( _
                        ob).HechizoIndex).MinHam

                If Hechizos(ObjData(ob).HechizoIndex).MaxSed > 0 Then Lainv = Lainv & vbNewLine & "S.Máximo: " & Hechizos(ObjData( _
                        ob).HechizoIndex).MaxSed

                If Hechizos(ObjData(ob).HechizoIndex).MinSed > 0 Then Lainv = Lainv & vbNewLine & "S.Mínimo: " & Hechizos(ObjData( _
                        ob).HechizoIndex).MinSed

                'target
                If Hechizos(ObjData(ob).HechizoIndex).Target = 1 Then afeti = "Sólo Usuarios."

                If Hechizos(ObjData(ob).HechizoIndex).Target = 2 Then afeti = "Sólo Npc´s."

                If Hechizos(ObjData(ob).HechizoIndex).Target = 3 Then afeti = "Usuarios y Npc´s."

                If Hechizos(ObjData(ob).HechizoIndex).Target = 4 Then afeti = "Terreno."
                Lainv = Lainv & vbNewLine & "Objetivo: " & afeti

            End If

            Dim pit As Byte

            For n = 1 To NUMCLASES

                If UCase$(ObjData(ob).ClaseProhibida(n)) = UCase$(UserClase) Then pit = 1
            Next

            If pit = 1 Then
                Lainv = Lainv & vbNewLine & "El " & UserClase & " NO puede usarlo."
            Else
                Lainv = Lainv & vbNewLine & "El " & UserClase & " puede usarlo."

            End If

            pit = 0

            '-----------------------------------------------------------
            '-----------------------------------------------------------
            'fabricación---------
            If ObjData(ob).LingH > 0 Or ObjData(ob).LingP > 0 Or ObjData(ob).LingO > 0 Or ObjData(ob).Madera > 0 Or ObjData(ob).Diamantes Or _
                    ObjData(ob).Gemas > 0 Then
                Lainv = Lainv & vbNewLine & vbNewLine & "Se puede Fabricar Con:"

                If ObjData(ob).LingO > 0 Then Lainv = Lainv & vbNewLine & "Lingotes Oro: " & ObjData(ob).LingO

                If ObjData(ob).LingP > 0 Then Lainv = Lainv & vbNewLine & "Lingotes Plata: " & ObjData(ob).LingP

                If ObjData(ob).LingH > 0 Then Lainv = Lainv & vbNewLine & "Lingotes Hierro: " & ObjData(ob).LingH

                If ObjData(ob).Madera > 0 Then Lainv = Lainv & vbNewLine & "Madera: " & ObjData(ob).Madera

                If ObjData(ob).Diamantes > 0 Then Lainv = Lainv & vbNewLine & "Diamantes: " & ObjData(ob).Diamantes

                If ObjData(ob).Gemas > 0 Then Lainv = Lainv & vbNewLine & "Gemas: " & ObjData(ob).Gemas

            End If

            '--------------------
    
            Call Mostrar_ToolTip(Form2, Inventario.Name(aux) & vbNewLine & String$(Len(Inventario.Name(aux)), "_") & vbNewLine & Lainv, &H80000018, _
                    vbBlack, DirInterfaces & "aodrag.ico")
                
            IndiceLabel = aux
        
        End If
    
    End If

End Sub

