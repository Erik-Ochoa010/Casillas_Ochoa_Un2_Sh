from flask import Flask, render_template, request, jsonify
import pandas as pd

app = Flask(__name__)

uploaded_data = None  # Variable global para almacenar el DataFrame cargado

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    global uploaded_data
    file = request.files.get('file')
    if file and file.filename.endswith(('.xlsx', '.xls')):
        try:
            uploaded_data = pd.read_excel(file)  # Cargar archivo Excel
            total_packages = len(uploaded_data)  # Contar el total de paquetes
            table_html = uploaded_data.to_html(index=False, classes='table table-striped table-bordered')
            return jsonify({
                'success': True,
                'table_html': table_html,
                'totalPackages': total_packages  # Enviar el total de paquetes
            })
        except Exception as e:
            return jsonify({'success': False, 'message': f'Error al procesar el archivo: {e}'})
    return jsonify({'success': False, 'message': 'Por favor sube un archivo Excel válido.'})

@app.route('/filter', methods=['GET'])
def filter_data():
    global uploaded_data
    weight = request.args.get('weight', type=float)  # Obtener el peso
    if uploaded_data is not None:
        if weight is not None:
            # Filtrar los registros
            filtered_df = uploaded_data[uploaded_data['Peso Kg'] > weight]
            filtered_packages = len(filtered_df)  # Contar los paquetes filtrados
            filtered_table_html = filtered_df.to_html(index=False, classes='table table-success table-bordered')
            return jsonify({
                'success': True,
                'filtered_table_html': filtered_table_html,
                'filteredPackages': filtered_packages  # Enviar el total de paquetes filtrados
            })
        else:
            return jsonify({'success': False, 'message': 'Peso no definido o inválido.'})
    return jsonify({'success': False, 'message': 'No hay datos cargados para filtrar.'})


if __name__ == '__main__':
    app.run(debug=True)
