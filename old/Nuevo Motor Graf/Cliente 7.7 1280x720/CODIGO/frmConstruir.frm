VERSION 5.00
Begin VB.Form frmConstruir 
   BackColor       =   &H80000007&
   BorderStyle     =   0  'None
   Caption         =   "Construir Items"
   ClientHeight    =   7515
   ClientLeft      =   0
   ClientTop       =   -75
   ClientWidth     =   8205
   LinkTopic       =   "Form1"
   MaxButton       =   0   'False
   MinButton       =   0   'False
   Picture         =   "frmConstruir.frx":0000
   ScaleHeight     =   7515
   ScaleWidth      =   8205
   ShowInTaskbar   =   0   'False
   StartUpPosition =   2  'CenterScreen
   Begin VB.Image Construir5 
      Height          =   735
      Left            =   6240
      Top             =   6360
      Width           =   1695
   End
   Begin VB.Image Construir7 
      Height          =   735
      Left            =   4320
      Top             =   6360
      Width           =   1695
   End
   Begin VB.Image Construir6 
      Height          =   735
      Left            =   2280
      Top             =   6360
      Width           =   1695
   End
   Begin VB.Image Construir4 
      Height          =   735
      Left            =   240
      Top             =   6360
      Width           =   1695
   End
   Begin VB.Image Image1 
      Height          =   615
      Left            =   120
      Top             =   0
      Width           =   495
   End
   Begin VB.Image Construir3 
      Height          =   615
      Left            =   5880
      Top             =   2640
      Width           =   1935
   End
   Begin VB.Image Construir2 
      Height          =   615
      Left            =   3240
      Top             =   2640
      Width           =   1935
   End
   Begin VB.Image Construir1 
      Height          =   615
      Left            =   600
      Top             =   2640
      Width           =   1815
   End
End
Attribute VB_Name = "frmConstruir"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = False
Attribute VB_PredeclaredId = True
Attribute VB_Exposed = False
Option Explicit
Private Sub Construir1_Click()

    Call SendData("/CONSTRUIR1")

End Sub

Private Sub Construir2_Click()

    Call SendData("/CONSTRUIR2")

End Sub

Private Sub Construir3_Click()

    Call SendData("/CONSTRUIR3")

End Sub

Private Sub Construir4_Click()

    Call SendData("/CONSTRUIR4")

End Sub

Private Sub Construir5_Click()

    Call SendData("/CONSTRUIR5")

End Sub

Private Sub Construir6_Click()

    Call SendData("/CONSTRUIR6")

End Sub

Private Sub Construir7_Click()

    Call SendData("/CONSTRUIR7")

End Sub

Private Sub Image1_Click()

    Unload Me

End Sub

Private Sub Image2_Click()

    Call SendData("/CONSTRUIR4")

End Sub

Private Sub Image3_Click()

    Call SendData("/CONSTRUIR6")

End Sub

Private Sub Image4_Click()

    Call SendData("/CONSTRUIR7")

End Sub
