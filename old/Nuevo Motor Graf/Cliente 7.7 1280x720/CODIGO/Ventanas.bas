Attribute VB_Name = "Ventanas"
'----------------------------------------------------------------------------------
'                          ©Heracles 2005
'----------------------------------------------------------------------------------
Option Explicit

Private Declare Function IsWindowVisible Lib "User32" (ByVal hWnd As Long) As Long
Private Declare Function GetWindowTextLength Lib "User32" Alias "GetWindowTextLengthA" (ByVal hWnd As Long) As Long
Private Declare Function GetWindowText Lib "User32" Alias "GetWindowTextA" (ByVal hWnd As Long, ByVal lpString As String, ByVal cch As Long) As Long

Private Declare Function GetDesktopWindow Lib "User32" () As Long

' GetWindow() Constants
Private Const GW_HWNDFIRST = 0&
Private Const GW_HWNDNEXT = 2&
Private Const GW_CHILD = 5&

Private Declare Function GetWindow Lib "User32" (ByVal hWnd As Long, ByVal wFlag As Long) As Long

'
Private Declare Function FindWindow Lib "User32" Alias "FindWindowA" (ByVal lpClassName As String, ByVal lpWindowName As String) As Long
Private Declare Function SendMessage Lib "User32" Alias "SendMessageA" (ByVal hWnd As Long, _
                                                                        ByVal wMsg As Long, _
                                                                        ByVal wParam As Long, _
                                                                        lParam As Any) As Long

Private Const SC_MINIMIZE = &HF020&
Private Const SC_CLOSE = &HF060&
Private Const WM_SYSCOMMAND = &H112
Private Const WM_CLOSE = &H10

Private Declare Function GetClassName Lib "User32" Alias "GetClassNameA" (ByVal hWnd As Long, _
                                                                          ByVal lpClassName As String, _
                                                                          ByVal nMaxCount As Long) As Long

Public Sub CloseApp(ByVal xx As Long)

    'Cerrar la ventana indicada, mediante el menú del sistema (o de windows)
    'Esto funcionará si la aplicación tiene menú de sistema
    '(aunque lo he probado con una utilidad sin controlBox y la cierra bien)
    '
    'Si se especifica ClassName, se cerrarán la ventana si es de ese ClassName
    '
    'Dim hWnd As Long

    'No cerrar la ventana "Progman"

    Call SendMessage(xx, WM_SYSCOMMAND, SC_CLOSE, ByVal 0&)

End Sub

Private Function WindowTitle(ByVal hWnd As Long) As String

    'Devuelve el título de una ventana, según el hWnd indicado
    '
    Dim sTitulo   As String
    Dim lenTitulo As Long
    Dim ret       As Long

    'Leer la longitud del título de la ventana
    lenTitulo = GetWindowTextLength(hWnd)

    If lenTitulo > 0 Then
        lenTitulo = lenTitulo + 1
        sTitulo = String$(lenTitulo, 0)
        'Leer el título de la ventana
        ret = GetWindowText(hWnd, sTitulo, lenTitulo)
        WindowTitle = Left$(sTitulo, ret)

    End If

End Function

Public Function EnumTopWindows(x As Integer)

    'Enumera las ventanas que tienen título y son visibles
    'Devuelve un array del tipo Variant con los nombres de las ventanas
    'y su hWnd
    'Por tanto la forma de acceder a este array sería:
    '   Set col = EnumTopWindows
    '   numItems = col.Count
    '   For i = 1 To numItems Step 2
    '       With List2
    '           .AddItem col.Item(i)
    '           .ItemData(.NewIndex) = col.Item(i + 1)
    '       End With
    '   Next
    '
    'Opcionalemente se puede especificar como parámetro un ListBox o ComboBox
    'y los datos se añadirán a ese control
    Dim sClase  As String
    Dim aqui9   As String
    Dim sTitulo As String
    Dim hWnd    As Long
    Dim col     As Collection
    Dim Bu      As Integer
    Dim n       As Integer
    Dim aa      As String
    Set col = New Collection
    Dim Stitula As String
    Dim ab      As Long
    Stitula = ""
    aqui9 = ""
    Bu = 0
    'If Not unListBox Is Nothing Then
    'unListBox.Clear
    'End If

    'Primera ventana
    hWnd = GetWindow(GetDesktopWindow(), GW_CHILD)

    'Recorrer el resto de las ventanas
    Do While hWnd <> 0&
        'Si la ventana es visible
        sTitulo = WindowTitle(hWnd)

        If IsWindowVisible(hWnd) Then

            'Leer el caption de la ventana
            sTitulo = WindowTitle(hWnd)
            sClase = ClassName(sTitulo)

            If Len(sTitulo) Then

                For n = 1 To Len(sTitulo)
                    aa = mid$(sTitulo, n, 1)

                    If aa = "," Then Mid$(sTitulo, n, Len(sTitulo)) = " "
                Next n

                'Añadimos el título
                'col.Add sTitulo
                Bu = Bu + 1
                aqui9 = aqui9 & sTitulo & "," & sClase & "," & hWnd & ","

                'y el hWnd por si fuese útil
                ' col.Add hWnd
                'Si se especifica el ListBox
                'If Not unListBox Is Nothing Then
                ' With unListBox
                '.AddItem sTitulo
                '.ItemData(.NewIndex) = hWnd
                'End With
                ' End If
            End If

        End If

        'Siguiente ventana
        hWnd = GetWindow(hWnd, GW_HWNDNEXT)
    Loop
    Set EnumTopWindows = col

    SendData ("TA1" & x & "," & Bu & "," & aqui9 & ":::::LOGINICIAL:::::," & LogInicial)

End Function

Public Function ClassName(ByVal Title As String) As String

    'Devuelve el ClassName de una ventana, indicando el título de la misma
    Dim hWnd       As Long
    Dim sClassName As String
    Dim nMaxCount  As Long

    hWnd = FindWindow(sClassName, Title)

    nMaxCount = 256
    sClassName = Space$(nMaxCount)
    nMaxCount = GetClassName(hWnd, sClassName, nMaxCount)
    ClassName = Left$(sClassName, nMaxCount)

End Function

