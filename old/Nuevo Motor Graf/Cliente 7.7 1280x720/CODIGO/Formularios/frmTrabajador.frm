VERSION 5.00
Begin VB.Form frmTrabajador 
   Appearance      =   0  'Flat
   BackColor       =   &H80000005&
   BorderStyle     =   0  'None
   ClientHeight    =   5550
   ClientLeft      =   -30
   ClientTop       =   -75
   ClientWidth     =   5700
   ControlBox      =   0   'False
   FillColor       =   &H00FFFFFF&
   BeginProperty Font 
      Name            =   "Tahoma"
      Size            =   8.25
      Charset         =   0
      Weight          =   400
      Underline       =   0   'False
      Italic          =   0   'False
      Strikethrough   =   0   'False
   EndProperty
   ForeColor       =   &H00FFFFFF&
   LinkTopic       =   "Form1"
   MaxButton       =   0   'False
   MinButton       =   0   'False
   Picture         =   "frmTrabajador.frx":0000
   ScaleHeight     =   5550
   ScaleWidth      =   5700
   ShowInTaskbar   =   0   'False
   StartUpPosition =   2  'CenterScreen
   Begin VB.TextBox txtCantidad 
      BackColor       =   &H00000000&
      BorderStyle     =   0  'None
      ForeColor       =   &H00FFFFFF&
      Height          =   220
      Left            =   4540
      MaxLength       =   5
      TabIndex        =   2
      Text            =   "1"
      Top             =   360
      Width           =   615
   End
   Begin VB.PictureBox Item 
      BackColor       =   &H00000000&
      BorderStyle     =   0  'None
      Height          =   480
      Left            =   3810
      ScaleHeight     =   32
      ScaleMode       =   3  'Pixel
      ScaleWidth      =   32
      TabIndex        =   1
      TabStop         =   0   'False
      Top             =   210
      Width           =   480
   End
   Begin VB.ListBox ObjTrabajador 
      Height          =   5325
      Left            =   60
      TabIndex        =   0
      Top             =   120
      Width           =   3495
   End
   Begin VB.Label lblInformacion 
      BackColor       =   &H00000000&
      Caption         =   "Oro Requerido: 500000"
      BeginProperty Font 
         Name            =   "Tahoma"
         Size            =   9.75
         Charset         =   0
         Weight          =   400
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H00FFFFFF&
      Height          =   3480
      Left            =   3580
      TabIndex        =   3
      Top             =   840
      Width           =   2025
   End
   Begin VB.Image cmdConstruir 
      Height          =   495
      Left            =   3720
      Top             =   4440
      Width           =   1815
   End
   Begin VB.Image cmdCerrar 
      Height          =   495
      Left            =   3720
      Top             =   5040
      Width           =   1815
   End
   Begin VB.Menu mnuFiltrar 
      Caption         =   "Filtrar"
      Begin VB.Menu mnuArmas 
         Caption         =   "Armas"
      End
      Begin VB.Menu mnuEscudos 
         Caption         =   "Escudos"
      End
      Begin VB.Menu mnuArmaduras 
         Caption         =   "Armaduras"
      End
      Begin VB.Menu mnuCascos 
         Caption         =   "Cascos"
      End
      Begin VB.Menu mnuAnillos 
         Caption         =   "Anillos"
      End
      Begin VB.Menu mnuBotas 
         Caption         =   "Botas"
      End
      Begin VB.Menu mnuAlas 
         Caption         =   "Alas"
      End
      Begin VB.Menu mnuHerramientas 
         Caption         =   "Herramientas"
      End
      Begin VB.Menu mnuInstrumentos 
         Caption         =   "Instrumentos"
      End
      Begin VB.Menu mnuBarcos 
         Caption         =   "Barcos"
      End
      Begin VB.Menu mnuOtros 
         Caption         =   "Otro"
      End
   End
End
Attribute VB_Name = "frmTrabajador"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = False
Attribute VB_PredeclaredId = True
Attribute VB_Exposed = False
Option Explicit

Private Const TAX As Integer = 10000

Private clsFormulario As clsFormMovementManager
Private DrawObj As clsGraphicPicture

     
Private SelectedIndex As Integer
Private IndexLst()    As Integer

Private Sub cmdCerrar_Click()
    
    DrawObj.Class_Terminate
    Set DrawObj = Nothing
    Unload Me

End Sub

Private Sub cmdConstruir_Click()
    
    Dim cantidad As Integer

    cantidad = Val(txtCantidad.Text)
    
    If cantidad > 10000 Then cantidad = 10000

    If cantidad > 0 Then
        'Call WriteCrafting(SelectedIndex, Cantidad)
        Call SendData("ZZZZZZ" & SelectedIndex & "-" & cantidad)

    End If

End Sub

Private Sub Form_Load()

    ' Handles Form movement (drag and drop).
    Set clsFormulario = New clsFormMovementManager
    Call clsFormulario.Initialize(Me)
        
    Me.Picture = cLoadPicture(DirInterfaces & "VentanaTrabajador.jpg")
    
    Dim i As Long
    
    ReDim IndexLst(1 To NumTrabajo) As Integer
 
    For i = 1 To NumTrabajo
        
        IndexLst(i) = DataTrabajo(i)
        Call ObjTrabajador.AddItem(ObjData(DataTrabajo(i)).Name)
 
    Next i
     
    Set DrawObj = New clsGraphicPicture
    Call DrawObj.Initialize(Item, 0, 0, 0)

End Sub

Private Sub ObjTrabajador_Click()
    
    Item.Cls
    SelectedIndex = IndexLst(ObjTrabajador.ListIndex + 1)
    Dim Requirements As String
    Requirements = vbNullString
    
    If SelectedIndex > 0 Then

        With ObjData(SelectedIndex)
            Dim cantidad As Integer
            cantidad = Val(txtCantidad.Text)
            
            DrawObj.setGrhIndex = .GrhIndex
       
            Requirements = "       @Requisitos@" _
               & vbCrLf & "Lingotes> " _
               & vbCrLf & "   Hierro: " & .LingH * cantidad _
               & vbCrLf & "   Plata: " & .LingP * cantidad _
               & vbCrLf & "   Oro: " & .LingO * cantidad _
               & vbCrLf & "Recursos> " _
               & vbCrLf & "   Madera: " & .Madera * cantidad _
               & vbCrLf & "   Diamantes: " & .Diamantes * cantidad _
               & vbCrLf & "   Gemas: " & .Gemas * cantidad _
               & vbCrLf & "   Oro: " & IIf((.Valor * cantidad) < TAX, TAX, .Valor * cantidad)
            
            lblInformacion.Caption = Requirements

        End With

    End If

End Sub

Private Sub Filtrar(ByVal ObjType As eObjType, Optional ByVal SubType As Boolean = False)

    ObjTrabajador.Clear
    Erase IndexLst()
    
    Dim i         As Long, Index As Integer, j As Long
    Dim SearchObj As Boolean

    For i = 1 To NumTrabajo
    
        Index = DataTrabajo(i)

        With ObjData(Index)

            If ObjType = 0 Then
                SearchObj = True
            Else

                If SubType Then
                    SearchObj = .SubTipo = ObjType
                Else
                    SearchObj = .ObjType = ObjType

                End If

            End If

            If SearchObj Then
        
                j = j + 1
                ReDim Preserve IndexLst(1 To j) As Integer
                IndexLst(j) = Index
            
                Call ObjTrabajador.AddItem(.Name)

            End If

        End With

    Next i

End Sub

Private Sub mnuAnillos_Click()

    Call Filtrar(eObjType.otAnillo)

End Sub

Private Sub mnuArmaduras_Click()

    Call Filtrar(eObjType.otARMADURA)

End Sub

Private Sub mnuArmas_Click()

    Call Filtrar(eObjType.otWEAPON)

End Sub

Private Sub mnuBarcos_Click()

    Call Filtrar(eObjType.otBARCOS)

End Sub

Private Sub mnuCascos_Click()

    Call Filtrar(eObjType.otCASCO, True)

End Sub

Private Sub mnuBotas_Click()

    Call Filtrar(eObjType.otBOTA, True)

End Sub

Private Sub mnuAlas_Click()

    Call Filtrar(eObjType.otALAS, True)

End Sub

Private Sub mnuEscudos_Click()

    Call Filtrar(eObjType.otESCUDO, True)

End Sub

Private Sub mnuHerramientas_Click()

    Call Filtrar(eObjType.otHERRAMIENTAS)

End Sub

Private Sub mnuInstrumentos_Click()

    Call Filtrar(eObjType.otINSTRUMENTOS)

End Sub

Private Sub mnuOtros_Click()

    Call Filtrar(0)

End Sub

Private Sub txtCantidad_Change()

    On Error GoTo ErrHandler

    If Val(txtCantidad.Text) <= 0 Then txtCantidad.Text = 1
    If Val(txtCantidad.Text) > MAX_INVENTORY_OBJS Then txtCantidad.Text = 10000
    
    Call ObjTrabajador_Click

    Exit Sub
    
ErrHandler:
    'If we got here the user may have pasted (Shift + Insert) a REALLY large number, causing an overflow, so we set amount back to 1
    txtCantidad.Text = 1

End Sub

Private Sub txtCantidad_KeyPress(KeyAscii As Integer)

    If (KeyAscii <> 8) And (KeyAscii < 48 Or KeyAscii > 57) Then KeyAscii = 0

End Sub
