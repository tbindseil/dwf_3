import { Model, Modifiers } from 'objection';

export default class PictureObjectionModel extends Model {
    id!: number;
    name!: string;
    created_by!: string;
    filename!: string;
    filesystem!: string;

    // Table name is the only required property.
    static tableName = 'picture';

    // Optional JSON schema. This is not the database schema! Nothing is generated
    // based on this. This is only used for validation. Whenever a model instance
    // is created it is checked against this schema. http://json-schema.org/.
    static jsonSchema = {
        type: 'object',
        required: ['id', 'name', 'created_by', 'filename', 'filesystem'],
        properties: {
            id: { type: 'integer' },
            name: { type: 'string', minLength: 1, maxLength: 255 },
            created_by: { type: 'string', minLength: 1, maxLength: 255 },
            filename: { type: 'string', minLength: 1, maxLength: 255 },
            filesystem: { type: 'string', minLength: 1, maxLength: 255 },
        },
    };

    // Modifiers are reusable query snippets that can be used in various places.
    //     static modifiers: Modifiers = {
    //         // Our example modifier is a a semi-dumb fuzzy name match. We split the
    //         // name into pieces using whitespace and then try to partially match
    //         // each of those pieces to both the `firstName` and the `lastName`
    //         // fields.
    //         searchByName(query, name) {
    //             // This `where` simply creates parentheses so that other `where`
    //             // statements don't get mixed with the these.
    //             query.where((query) => {
    //                 for (const namePart of name.trim().split(/\s+/)) {
    //                     for (const column of ['firstName', 'lastName']) {
    //                         query.orWhereRaw('lower(??) like ?', [
    //                             column,
    //                             namePart.toLowerCase() + '%',
    //                         ]);
    //                     }
    //                 }
    //             });
    //         },
    //     };

    // This object defines the relations to other models. The relationMappings
    // property can be a thunk to prevent circular dependencies.
    //     static relationMappings = () => ({
    //         pets: {
    //             relation: Model.HasManyRelation,
    //             // The related model. This can be either a Model subclass constructor or an
    //             // absolute file path to a module that exports one.
    //             modelClass: Animal,
    //             join: {
    //                 from: 'persons.id',
    //                 to: 'animals.ownerId',
    //             },
    //         },
    //
    //         movies: {
    //             relation: Model.ManyToManyRelation,
    //             modelClass: Movie,
    //             join: {
    //                 from: 'persons.id',
    //                 // ManyToMany relation needs the `through` object to describe the join table.
    //                 through: {
    //                     from: 'persons_movies.personId',
    //                     to: 'persons_movies.movieId',
    //                 },
    //                 to: 'movies.id',
    //             },
    //         },
    //
    //         children: {
    //             relation: Model.HasManyRelation,
    //             modelClass: Person,
    //             join: {
    //                 from: 'persons.id',
    //                 to: 'persons.parentId',
    //             },
    //         },
    //
    //         parent: {
    //             relation: Model.BelongsToOneRelation,
    //             modelClass: Person,
    //             join: {
    //                 from: 'persons.parentId',
    //                 to: 'persons.id',
    //             },
    //         },
    //     });
}
