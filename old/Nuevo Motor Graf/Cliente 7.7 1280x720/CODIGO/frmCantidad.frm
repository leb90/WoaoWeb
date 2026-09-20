VERSION 5.00
Begin VB.Form frmCantidad 
   Appearance      =   0  'Flat
   BackColor       =   &H80000005&
   BorderStyle     =   0  'None
   ClientHeight    =   3000
   ClientLeft      =   1635
   ClientTop       =   4410
   ClientWidth     =   3690
   ClipControls    =   0   'False
   ControlBox      =   0   'False
   KeyPreview      =   -1  'True
   LinkTopic       =   "Form1"
   MaxButton       =   0   'False
   MinButton       =   0   'False
   Picture         =   "frmCantidad.frx":0000
   ScaleHeight     =   3000
   ScaleWidth      =   3690
   ShowInTaskbar   =   0   'False
   StartUpPosition =   2  'CenterScreen
   Begin VB.TextBox Text1 
      Alignment       =   2  'Center
      Appearance      =   0  'Flat
      BackColor       =   &H00000040&
      BorderStyle     =   0  'None
      BeginProperty Font 
         Name            =   "Courier New"
         Size            =   12
         Charset         =   0
         Weight          =   700
         Underline       =   0   'False
         Italic          =   0   'False
         Strikethrough   =   0   'False
      EndProperty
      ForeColor       =   &H00FFFFFF&
      Height          =   270
      Left            =   740
      TabIndex        =   0
      Top             =   1160
      Width           =   2205
   End
   Begin VB.Image Image2 
      Height          =   495
      Left            =   960
      MouseIcon       =   "frmCantidad.frx":86B8
      MousePointer    =   99  'Custom
      Top             =   1680
      Width           =   1695
   End
   Begin VB.Image Image1 
      Height          =   495
      Left            =   960
      MouseIcon       =   "frmCantidad.frx":9382
      MousePointer    =   99  'Custom
      Top             =   2280
      Width           =   1695
   End
End
Attribute VB_Name = "frmCantidad"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = False
Attribute VB_PredeclaredId = True
Attribute VB_Exposed = False
Option Explicit

Private Sub Form_Load()

    frmCantidad.Picture = cLoadPicture(DirInterfaces & "cantidadflash.jpg")

End Sub

Private Sub Form_Deactivate()

    Unload Me

End Sub

Private Sub Image1_Click()

    Unload Me

End Sub

Private Sub Image2_Click()

    If Not NoPuedeTirar Then
        NoPuedeTirar = True
        SendData "TI" & Inventario.SelectedItem & "," & frmCantidad.Text1.Text
        frmCantidad.Text1.Text = "0"

    End If
    
    CerrarVentana

End Sub

Private Sub Text1_Change()

    If Val(Text1.Text) < 0 Then
        Text1.Text = 1

    End If

    If Val(Text1.Text) > MAX_INVENTORY_OBJS Then
        Text1.Text = MAX_INVENTORY_OBJS
    End If

End Sub

Private Sub Text1_KeyPress(KeyAscii As Integer)

    If (KeyAscii <> 8) Then

        If (KeyAscii < 48 Or KeyAscii > 57) Then
            KeyAscii = 0

        End If

    End If

End Sub

Private Sub Form_KeyDown(KeyCode As Integer, Shift As Integer)

    If KeyCode = vbKeyEscape Then CerrarVentana

End Sub

Private Sub CerrarVentana()

    Unload Me

    If frmMain.Visible Then frmMain.SetFocus
  
    Exit Sub

End Sub

