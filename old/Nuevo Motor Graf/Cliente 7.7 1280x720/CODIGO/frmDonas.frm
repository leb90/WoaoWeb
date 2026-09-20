VERSION 5.00
Begin VB.Form frmDonas 
   Caption         =   "Form1"
   ClientHeight    =   7215
   ClientLeft      =   120
   ClientTop       =   465
   ClientWidth     =   9135
   LinkTopic       =   "Form1"
   ScaleHeight     =   7215
   ScaleWidth      =   9135
   StartUpPosition =   3  'Windows Default
   Begin VB.ListBox ListaDonaciones 
      Height          =   4740
      Left            =   240
      TabIndex        =   0
      Top             =   480
      Width           =   3255
   End
End
Attribute VB_Name = "frmDonas"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = False
Attribute VB_PredeclaredId = True
Attribute VB_Exposed = False
Option Explicit

Private Sub ListaDonaciones_Click()

Call SendData("DPX" & ListaDonaciones.ListIndex + 1)

End Sub
