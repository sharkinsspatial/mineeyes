function generateESRIData(valid) {
    var esriFeatures = {
        'displayFieldName':'UNIDAD',
        'fieldAliases':{
            'OBJECTID':'OBJECTID',
            'EMPRESA':'Empresa',
            'ESTADO':'Estado'
        },
        'geometryType':'esriGeometryPoint',
        'spatialReference':{
            'wkid':4326,'latestWkid':4326
        },'fields':[{
            'name':'OBJECTID',
            'type':'esriFieldTypeOID',
            'alias':'OBJECTID'
            },
            {'name':'EMPRESA',
             'type':'esriFieldTypeString',
             'alias':'Empresa','length':254
            },
            {'name':'ESTADO',
             'type':'esriFieldTypeString',
             'alias':'Estado',
             'length':254
            }],
             'features':[{
                'attributes':{
                    'OBJECTID':304,
                    'EMPRESA':'COMPANIA DE MINAS BUENAVENTURA S.A.A.',
                    'ESTADO':'EXPLORACION'
                },
                'geometry':{
                    'x': 4,
                    'y': -4 
                }
            }]
        };
    if (valid) {
    } else {
        esriFeatures.features[0].geometry.x = NaN;        
    }
    return esriFeatures;
}
function generateXMLData(valid) {
    var xml;
    if (valid) {
        xml = '<item><geo:lat xmlns:geo="test">5.1</geo:lat>' + 
            '<geo:long xmlns:geo="test">1.4</geo:long></item>';
    } else {
        xml = '<item><geo:lat xmlns:geo="test">5.1</geo:lat></item>';
    }
    var xmlDocument = $.parseXML(xml);
    return xmlDocument;
}
